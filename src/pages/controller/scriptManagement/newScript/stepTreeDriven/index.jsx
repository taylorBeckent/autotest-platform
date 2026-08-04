import React, { useEffect, useState, useCallback, useRef } from 'react';
import { LinkOutlined, CopyOutlined, DeleteOutlined, DragOutlined, RightOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, message, Upload, Menu } from 'antd';
import { connect } from 'umi';
import TreeNode from './TreeNode';
import utils from '../../utils';
import download from '@/utils/download';
import styles from './index.less';

const TreeHandle = (props) => {

    const {
        dispatch,
        nodeTypeMap,
        nodeTypeReverseMap,
        onLoading,
        activeTabs,
        scriptManagement: { stepTreeList, caseInfo, selectedNode }
    } = props;

    const [dataList, setDataList] = useState([]);
    const [dragOverInfo, setDragOverInfo] = useState(null);
    const dragItemRef = useRef(null);
    const dragDataRef = useRef(null);

    //. 上次选中节点信息
    const previousSelectedRef = useRef(null);

    useEffect(() => {
        setDataList(stepTreeList);
    }, [stepTreeList])

    useEffect(() => {
        activeTabs == 'dataDriven' && (searchDataDrivenTable(selectedNode), console.log(11111));
    }, [activeTabs])

    //. 更新所有节点（包括嵌套的子节点）
    const updateAllNodes = useCallback((nodes, callback) => {
        return nodes.map(node => {
            const updatedNode = callback(node);
            if (updatedNode.childNode && updatedNode.childNode.length > 0) {
                updatedNode.childNode = updateAllNodes(updatedNode.childNode, callback);
            }
            return updatedNode;
        })
    }, []);

    //. 鼠标事件
    const handleMouseAction = useCallback((e, item, action) => {
        setDataList(prev =>
            updateAllNodes(prev, node => {
                if (node.id === item.id) {
                    return {
                        ...node,
                        isHovered: action === 'mouseEnter'
                    };
                }
                return node;
            })
        );
    }, [updateAllNodes]);

    //. 查询数据驱动生成表
    const searchDataDrivenTable = (currentNode) => {
        if ((currentNode.nodeType == 2 || currentNode.nodeType == 4) && !currentNode.isQuote) {
            if (currentNode?.step_code) {
                dispatch({
                    type: 'scriptManagement/QueryCreate',
                    params: {
                        step_code: currentNode.step_code
                    },
                    callback: _ => { }
                })
            } else {
                dispatch({
                    type: 'scriptManagement/syncDataDrivenTableList',
                    dataDrivenTableList: []
                })
            }
        }
    };

    //. 选中节点
    const handleSelected = useCallback((e, item) => {

        //. 获取上次选中的节点信息（老节点）
        const oldNode = previousSelectedRef.current;
        const newNode = item;

        if (oldNode && oldNode.id === newNode.id) {

        } else if (oldNode && newNode) {

        } else { }

        setDataList(prev => {
            let newTreeList = updateAllNodes(prev, node => ({
                ...node,
                isSelected: node.id === item.id,
            }));

            dispatch({
                type: 'scriptManagement/syncStepTreeList',
                stepTreeList: newTreeList
            })

            return newTreeList;
        })

        previousSelectedRef.current = newNode;

        dispatch({
            type: 'scriptManagement/syncSelectedNode',
            selectedNode: item
        });

        searchDataDrivenTable(item);

    }, [updateAllNodes]);

    // 展开/折叠
    const handleCollapse = useCallback((itemId) => {
        setDataList(prev => {
            const updateNode = (nodes) => {
                return nodes.map(node => {
                    if (node.id === itemId) {
                        const updatedNode = {
                            ...node,
                            collapse: !node.collapse
                        };
                        if (node.childNode && node.childNode.length > 0) {
                            updatedNode.childNode = updateNode(node.childNode);
                        }
                        return updatedNode;
                    }
                    if (node.childNode && node.childNode.length > 0) {
                        const updateChildNode = updateNode(node.childNode);
                        if (updateChildNode !== node.childNode) {
                            return {
                                ...node,
                                childNode: updateChildNode
                            };
                        }
                    }
                    return node;
                });
            };

            const newList = updateNode(prev);
            return newList;
        });
    }, []);

    // 查找节点和父节点
    const findNodeAndParent = (nodes, id, parent = null, depth = 0) => {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.id === id) {
                return { node, index: 1, parent, depth };
            }
            if (node.childNode && node.childNode.length > 0) {
                const result = findNodeAndParent(node.childNode, id, node, depth + 1);
                if (result) return result;
            }
        }
        return null;
    };

    //. 拖动起始 - 记录父节点位置
    const handleDragStart = useCallback((e, itemId, depth) => {
        e.stopPropagation();
        const draggableItem = e.currentTarget.closest('.draggable-item');
        if (!draggableItem) return;

        // 查找拖动节点的父节点信息
        const draggedInfo = findNodeAndParent(dataList, itemId);
        const parentId = draggedInfo?.parent ? draggedInfo.parent.id : null;

        dragItemRef.current = draggableItem;
        dragDataRef.current = {
            itemId,
            depth,
            parentId
        };

        e.dataTransfer.setData('text/plain', itemId);
        e.dataTransfer.effectAllowed = 'move';

        const dragImage = draggableItem.cloneNode(true);
        dragImage.style.width = `${draggableItem.offsetWidth}px`;
        dragImage.style.opacity = '0.7';
        dragImage.style.position = 'absolute';
        dragImage.style.left = '-1000px';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 20, 20);

        draggableItem.classList.add('dragging');

        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    }, [dataList]);

    //. 放置目标处理 - 检测是否在同一父节点下
    const handleDragOver = useCallback((e, itemId, depth) => {
        e.preventDefault();

        // 检查是否有拖动数据
        if (!dragDataRef.current) {
            e.dataTransfer.dropEffect = 'none';
            return;
        }

        const { itemId: draggedId, depth: draggedDepth, parentId: draggedParentId } = dragDataRef.current;

        // 如果是同一个节点，不允许拖放
        if (draggedId === itemId) {
            e.dataTransfer.dropEffect = 'none';
            setDragOverInfo(null);
            return;
        }

        // 查找目标节点的父节点信息
        const targetInfo = findNodeAndParent(dataList, itemId);
        const targetParentId = targetInfo?.parent ? targetInfo.parent.id : null;

        //. 检查是否允许拖放： 深度相同且父节点相同
        let canDrop = false;

        //. 情况1： 都是根节点（parentId 都为 null)
        if (draggedDepth === 0 && depth === 0 && draggedParentId === null && targetParentId === null) {
            canDrop = true;
        }

        //. 情况2： 都是子节点且父节点相同
        else if (draggedDepth > 0 && depth > 0 && draggedParentId === targetParentId) {
            canDrop = true;
        }

        if (!canDrop) {
            e.dataTransfer.dropEffect = 'none';
            setDragOverInfo(null);
            return;
        }

        e.dataTransfer.dropEffect = 'move';

        // 如果 dragOverInfo 已经设置且相同，直接返回
        if (dragOverInfo?.id === itemId && dragOverInfo?.position) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const position = mouseY < rect.height / 2 ? 'before' : 'after';

        setDragOverInfo({ id: itemId, position, depth });
    }, [dragOverInfo, dataList]);

    const handleDragLeave = useCallback(e => {
        const relatedTarget = e.relatedTarget;
        if (!e.currentTarget.contains(relatedTarget)) {
            setDragOverInfo(null);
        }
    }, []);

    // 清理拖动状态
    const cleanUpDrag = useCallback(() => {
        setDragOverInfo(null);
        if (dragItemRef.current) {
            dragItemRef.current.classList.remove('dragging');
        }
        dragItemRef.current = null;
        dragDataRef.current = null;
    }, []);

    // 从数组中删除指定节点
    const removeNodeFromArray = (nodes, id) => {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === id) {
                return nodes.splice(i, 1)[0];
            }
            if (nodes[i].childNode && nodes[i].childNode.length > 0) {
                const removed = removeNodeFromArray(nodes[i].childNode, id);
                if (removed) return removed;
            }
        }
        return null;
    };

    //. 放置处理 - 确保在同一父节点下拖动
    const handleDrop = useCallback((e, targetId, depth) => {
        e.preventDefault();
        e.stopPropagation();

        const draggedId = e.dataTransfer.getData('text/plain');
        if (!draggedId || draggedId === targetId || !dragOverInfo || !dragDataRef.current) {
            cleanUpDrag();
            return;
        }

        const { depth: draggedDepth, parentId: draggedParentId } = dragDataRef.current;

        //. 是否允许拖放
        let canDrop = false;

        //. 情况1： 都是根节点
        if (draggedDepth === 0 && depth === 0 && draggedParentId === null) {
            canDrop = true;
        }

        //. 情况2： 都是子节点且父节点相同
        else if (draggedDepth > 0 && depth > 0 && draggedParentId) {
            const targetInfo = findNodeAndParent(dataList, targetId);
            const targetParentId = targetInfo?.parent ? targetInfo.parent.id : null;
            canDrop = draggedParentId === targetParentId;
        }

        if (!canDrop) {
            cleanUpDrag();
            return;
        }

        setDataList(prev => {
            const itemsCopy = JSON.parse(JSON.stringify(prev));

            // 查找拖动节点和目标节点信息（在副本中查找）
            const draggedInfo = findNodeAndParent(itemsCopy, draggedId);
            const targetInfo = findNodeAndParent(itemsCopy, targetId);

            if (!draggedInfo || !targetInfo) {
                return prev;
            }

            //. 确定父节点数据
            let parentArray;
            if (draggedDepth === 0) {
                //. 根节点，父数组就是根数组
                parentArray = itemsCopy;
            } else {
                //. 子节点，找到父节点
                const parentNode = findNodeAndParent(itemsCopy, draggedParentId)?.node;
                if (!parentNode) {
                    // console.log('未找到父节点');
                    return itemsCopy;
                }
                parentArray = parentNode.childNode;
            }

            // 从父数组中移除拖动节点
            const removeNode = removeNodeFromArray(parentArray, draggedId);
            if (!removeNode) {
                // console.log('移除节点失败');
                return itemsCopy;
            }

            //. 获取目标节点在父数组中的索引
            let targetIndex = -1;
            for (let i = 0; i < parentArray.length; i++) {
                if (parentArray[i].id === targetId) {
                    targetIndex = i;
                    break;
                }
            }

            if (targetIndex === -1) {
                // console.log('未找到目标节点在父数组中的位置');
                // 回退： 将移除的节点放回原位置
                if (draggedInfo.index !== undefined) {
                    parentArray.splice(draggedInfo.index, 0, removeNode);
                }
                return itemsCopy;
            }

            //. 计算插入位置
            let insertIndex;

            // 如果拖动节点在目标节点之前，并且要拖动到目标节点之后
            if (draggedInfo.index < targetIndex && dragOverInfo.position === 'after') {
                insertIndex = targetIndex; //. 因为已经移除了拖动节点，所以目标索引不变
            }

            //. 如果拖动节点在目标节点之后，并且要拖动到目标节点之前
            else if (draggedInfo.index > targetIndex && dragOverInfo.position === 'before') {
                insertIndex = targetIndex;
            }

            //. 如果拖动到目标节点之后
            else {
                insertIndex = targetIndex + 1;
            }

            //. 确保 insertIndex 在有效范围内
            insertIndex = Math.max(0, Math.min(insertIndex, parentArray.length));

            //. 插入节点
            parentArray.splice(insertIndex, 0, removeNode);

            return itemsCopy;
        });

        cleanUpDrag();
    }, [dragOverInfo, dataList, cleanUpDrag]);

    //. 拖动结束
    const handleDragEnd = useCallback(() => {
        cleanUpDrag();
    }, [cleanUpDrag]);

    const generateId = useCallback(() => {
        return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }, []);





    //. 添加节点
    const handleAddNode = useCallback((nodeType, parentId, depth, currentChildNode, nodeInfo) => {
        let newNode = {
            id: generateId(),
            nodeType,
            content: nodeTypeMap[nodeType],
            step_name: nodeTypeMap[nodeType],
            step_type: nodeTypeMap[nodeType],
            depth: 0,
            isHovered: false,
            isSelected: false,
            draggable: false,
            collapse: true,
            haveChild: nodeType === 1,
            request_args_type: 'none',
            // childNode: [],
            childNode: (nodeType === 1 && currentChildNode.length > 0) ? currentChildNode : [],
            quote_steps: (nodeType === 1 && currentChildNode.length > 0) ? currentChildNode : [],
        };

        if (nodeType === 1) {
            newNode.content = nodeInfo?.nodeName;
            newNode.step_name = nodeInfo?.nodeName;
            newNode.quote_case_id = nodeInfo?.quote_case_id
        }

        //. 如果没有parentId, 说明添加的是根节点
        if (!parentId) {
            setDataList(prev => {
                let newTreeList = [...prev, newNode];

                setTimeout(() => {
                    dispatch({
                        type: 'scriptManagement/syncStepTreeList',
                        stepTreeList: newTreeList
                    })
                }, 0)

                return newTreeList;
            });
            return;
        }

        //. 有parentId, 找到父节点并添加子节点
        const addChildToParent = (nodes) => {
            return nodes.map(node => {
                if (node.id === parentId) {
                    // 如果父节点没有子节点数组，先初始化
                    const childNode = node.childNode || [];
                    return {
                        ...node,
                        collapse: false, //. 添加子节点后自动展开父节点
                        childNode: [...childNode, newNode]
                    }
                }

                if (node.childNode && node.childNode.length > 0) {
                    return {
                        ...node,
                        childNode: addChildToParent(node.childNode)
                    }
                }

                return node;
            })
        }

        setDataList(prev => {
            let newTreeList = addChildToParent(prev);

            setTimeout(() => {
                dispatch({
                    type: 'scriptManagement/syncStepTreeList',
                    stepTreeList: newTreeList
                })
            }, 0)

            return newTreeList;
        });
    }, [generateId]);

    const handleDeleteNode = (nodeId) => {
        setDataList(prev => {
            let newTreeList = prev.filter(item => item.id !== nodeId);

            dispatch({
                type: 'scriptManagement/syncStepTreeList',
                stepTreeList: newTreeList
            })

            return newTreeList;
        })
    };

    const batchBeforeUpload = () => {
        let stepTree = JSON.parse(JSON.stringify(dataList));
        if (stepTree.length === 0) {
            message.error(`当前脚本暂无步骤，请先新增步骤并保存后，再进行上传数据源操作`);
            return false;
        }

        const duplicateList = utils.duplicateStepNameCheck(stepTree);
        if (duplicateList.length > 0) {
            message.error(`步骤树中存在相同步骤名：${duplicateList.toString()}  请检查`);
            return false;
        }

        const unSavedList = utils.newStepCheck(stepTree);
        if (unSavedList.length > 0) {
            message.error(`步骤树中存在未保存步骤：${unSavedList.toString()}  请保存后再进行批量上传操作`);
            return false;
        }

        return true;
    };

    //. 批量上传
    const batchStepUpload = (info) => {
        if (info.file.status !== 'uploading') { }
        if (info.file.status === 'done') {
            const res = info.file.response;
            if (res?.code === '000000') {
                message.success('上传已完成！');
            } else {
                message.error(res?.message);
            }
            return;
        }
    };

    //. 汇总下载
    const batchDownload = () => {
        let formData = new FormData();
        formData.append('case_id', caseInfo?.case_id);
        formData.append('case_code', caseInfo?.case_code);
        formData.append('case_name', caseInfo?.case_name);
        onLoading('loading');
        download.postGetExcelSync('/database/lb/autotest/download-steps', formData, () => { onLoading('end') });
    };

    const menu = (
        <div className={styles['batch-menu']}>
            <Menu>
                <Menu.Item key="upload" style={{ width: '100%' }} onClick={e => e.domEvent.stopPropagation()}>
                    <Upload
                        style={{ width: '100%' }}
                        accept=".xlsx, .xls"
                        action="/database/lb/autotest/upload-steps"
                        showUploadList={false}
                        beforeUpload={batchBeforeUpload}
                        onChange={batchStepUpload}
                        maxCount={1}
                        withCredentials
                        data={{
                            case_info: JSON.stringify({ case: caseInfo, steps: stepTreeList })
                        }}
                    >
                        {/* <div style={{ width: '100%' }} onClick={(e) => { e.stopPropagation() }}>批量上传</div> */}
                        <Button style={{ width: '100%' }} type="text" >批量上传</Button>
                    </Upload>
                </Menu.Item>
                <Menu.Item key="download" style={{ width: '100%' }}  >
                    <Button style={{ width: '100%' }} type="text" block onClick={batchDownload} >汇总下载</Button>
                </Menu.Item>
            </Menu>
        </div>
    );

    return (
        <div>
            <div className={styles['container']} style={{ height: '664px', paddingRight: 0 }}>
                <div className='container-bd'>
                    {dataList.map((item, index) => (
                        <TreeNode
                            style={{ maxHeight: '628px' }}
                            key={`tree-node-${item.id}-${index}`}
                            node={item}
                            index={index}
                            depth={0}
                            onMouseAction={handleMouseAction}
                            onSelect={handleSelected}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onDragEnd={handleDragEnd}
                            onCollapse={handleCollapse}
                            onAddNode={handleAddNode}
                            onDeleteNode={handleDeleteNode}
                            dragOverInfo={dragOverInfo}
                        />
                    ))}
                </div>
                <div className={styles['add-step']}>
                    <div style={{ width: 20, height: 36 }}></div>
                    <Dropdown overlay={menu} placement="top" trigger={['click']}>
                        <Button type="dashed">脚本测试数据</Button>
                    </Dropdown>
                </div>
            </div>
        </div>
    )
}

export default connect(({ newScript, scriptManagement }) => ({
    newScript,
    scriptManagement
}))(TreeHandle);