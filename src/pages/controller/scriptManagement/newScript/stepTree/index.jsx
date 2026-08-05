import React, { useEffect, useState, useCallback, useRef } from 'react';
import { LinkOutlined, CopyOutlined, DeleteOutlined, DragOutlined, RightOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { connect } from 'umi';
import TreeNode from './TreeNode';
import AddScriptModal from './AddScriptModal';
import CopyScriptModal from './CopyScriptModal';
import './index.css';
/**
 * 
 * @param {*} selectedNode.nodeType=='4'是TCP连接  ==2是HTTP连接
 * @returns 
 */
const TreeHandle = (props) => {

    const {
        dispatch,
        nodeTypeMap,
        nodeTypeReverseMap,
        scriptManagement: { stepTreeList, caseInfo, selectedNode }
    } = props;

    const [dataList, setDataList] = useState([]);
    const [dragOverInfo, setDragOverInfo] = useState(null);
    const dragItemRef = useRef(null);
    const dragDataRef = useRef(null);
    const dataListRef = useRef(dataList);

    //. 上次选中节点信息
    const previousSelectedRef = useRef(null);

    //. 添加引用脚本弹窗
    const [addModalStatus, setAddModalStatus] = useState('closed');

    //. 添加节点类型
    const [DropItemList, setDropItemList] = useState([]);

    const DropItem = [
        { key: '引用公共脚本/接口', label: (<div onClick={() => { setAddModalStatus('quote') }} >引用公共脚本/接口</div>) },
        { key: '复制脚本/接口', label: (<div onClick={() => { setAddModalStatus('copy') }} >复制脚本/接口</div>) },
        { key: 'HTTP请求', label: (<div onClick={() => { handleAddNode(2, null, 0, []) }} >HTTP请求</div>) },
        { key: 'TCP请求', label: (<div onClick={() => { handleAddNode(4, null, 0, []) }} >TCP请求</div>) },
        { key: '等待控制', label: (<div onClick={() => { handleAddNode(3, null, 0, []) }} >等待控制</div>) },
        { key: '数据库请求', label: (<div onClick={() => { handleAddNode(5, null, 0, []) }} >数据库操作</div>) },
        { key: '代码请求(Python)', label: (<div onClick={() => { handleAddNode(6, null, 0, []) }} >Python代码</div>) },
        { key: '报文比对', label: (<div onClick={() => { handleAddNode(9, null, 0, []) }} >报文比对</div>) },
    ];

    const DropItemPublic = [
        { key: '复制脚本/接口', label: (<div onClick={() => { setAddModalStatus('copy') }} >复制脚本/接口</div>) },
        { key: 'HTTP请求', label: (<div onClick={() => { handleAddNode(2, null, 0, []) }} >HTTP请求</div>) },
        { key: 'TCP请求', label: (<div onClick={() => { handleAddNode(4, null, 0, []) }} >TCP请求</div>) },
        { key: '等待控制', label: (<div onClick={() => { handleAddNode(3, null, 0, []) }} >等待控制</div>) },
        { key: '数据库请求', label: (<div onClick={() => { handleAddNode(5, null, 0, []) }} >数据库操作</div>) },
        { key: '代码请求(Python)', label: (<div onClick={() => { handleAddNode(6, null, 0, []) }} >Python代码</div>) },
        { key: '报文比对', label: (<div onClick={() => { handleAddNode(9, null, 0, []) }} >报文比对</div>) },
    ];

    useEffect(() => {
        setDropItemList(DropItem);
    }, []);

    useEffect(() => {
        setDataList(stepTreeList);
    }, [stepTreeList])

    useEffect(() => {
        if (caseInfo?.case_type === '公共脚本') {
            setDropItemList(DropItemPublic);
        } else if (caseInfo?.case_type === '用户脚本') {
            setDropItemList(DropItem);
        }
    }, [caseInfo])

    useEffect(() => {
        dataListRef.current = dataList;
    }, [dataList])

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

    //. 选中节点
    const handleSelected = useCallback((e, item) => {

        //. 获取上次选中的节点信息（老节点）
        const oldNode = previousSelectedRef.current;
        const newNode = item;

        if (oldNode && oldNode.id === newNode.id) {
        } else if (oldNode && newNode) {
        } else {
        }

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
                return { node, index: i, parent, depth };
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
        const currentDataList = dataListRef.current;
        const draggedInfo = findNodeAndParent(currentDataList, itemId);
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
    }, []);

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
        const currentDataList = dataListRef.current;
        const targetInfo = findNodeAndParent(currentDataList, itemId);
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

        // const rect = e.currentTarget.getBoundingClientRect();
        // const mouseY = e.clientY - rect.top;
        // const position = mouseY < rect.height / 2 ? 'before' : 'after';

        const position = 'after';

        setDragOverInfo(prev => {
            // 如果 dragOverInfo 已经设置且相同，则返回
            if (prev?.id === itemId && prev?.position === position) return prev;
            return { id: itemId, position, depth };
        })
    }, []);

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

        // 使用函数式 setState 获取最新的 dragOverInfo
        setDragOverInfo(currentDragOverInfo => {
            if (!draggedId || draggedId === targetId || !currentDragOverInfo || !dragDataRef.current) {
                cleanUpDrag();
                return null;
            }

            const { depth: draggedDepth, parentId: draggedParentId } = dragDataRef.current;

            let canDrop = false;
            if (draggedDepth === 0 && depth === 0 && draggedParentId === null) {
                canDrop = true;
            } else if (draggedDepth > 0 && depth > 0 && draggedParentId) {
                const targetInfo = findNodeAndParent(dataListRef.current, targetId);
                const targetParentId = targetInfo?.parent ? targetInfo.parent.id : null;
                canDrop = draggedParentId === targetParentId;
            }

            if (!canDrop) {
                cleanUpDrag();
                return null;
            }

            setDataList(prev => {
                const itemsCopy = JSON.parse(JSON.stringify(prev));

                // 确定父节点数组
                let parentArray;
                if (draggedDepth === 0) {
                    parentArray = itemsCopy;
                } else {
                    const parentNode = findNodeAndParent(itemsCopy, draggedParentId)?.node;
                    if (!parentNode) return prev;
                    parentArray = parentNode.childNode;
                }

                // 找到被拖拽节点和目标节点的当前索引

                let draggedIndex = parentArray.findIndex(n => n.id == draggedId);
                let targetIndex = parentArray.findIndex(n => n.id == targetId);

                if (draggedIndex === -1 || targetIndex === -1) return prev;

                // 1. 先从数组中移除被拖拽的节点
                const [removedNode] = parentArray.splice(draggedIndex, 1);

                // 2. 移除后，目标节点的索引可能发生变化，需要重新获取
                targetIndex = parentArray.findIndex(n => n.id == targetId);

                // 3. 计算新的插入位置
                // let insertIndex = currentDragOverInfo.position === 'before' ? targetIndex : targetIndex + 1;
                let insertIndex = targetIndex + 1;

                // 4. 插入节点
                parentArray.splice(insertIndex, 0, removedNode);

                dispatch({
                    type: 'scriptManagement/syncStepTreeList',
                    stepTreeList: itemsCopy
                });

                return itemsCopy;
            });

            cleanUpDrag();
            return null; // 清空 dragOverInfo
        });
    }, [cleanUpDrag, dispatch]);

    //. 拖动结束
    const handleDragEnd = useCallback(() => {
        cleanUpDrag();
    }, [cleanUpDrag]);

    const generateId = useCallback(() => {
        return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }, []);

    function nodeTypeToView(nodeType) {
        if (nodeTypeMap[nodeType] === '代码请求(Python)') {
            return 'Python代码';
        }
        if (nodeTypeMap[nodeType] === '数据库请求') {
            return '数据库操作';
        }
        return nodeTypeMap[nodeType];
    };

    //. 添加节点
    const handleAddNode = useCallback((nodeType, parentId, depth, currentChildNode, nodeInfo) => {
        const codeName = nodeTypeToView(nodeType)
        let newNode = {
            id: generateId(),
            nodeType,
            content: codeName,
            step_name: codeName,
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

        if (nodeId === selectedNode.id) {
            dispatch({
                type: 'scriptManagement/syncSelectedNode',
                selectedNode: {}
            })
        }
    };

    return (
        <div>
            <div className="container" style={{ height: '664px', paddingRight: 0 }}>
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
                <div className="add-step">
                    <div style={{ width: 20, height: 36 }}></div>
                    <Dropdown menu={{ items: DropItemList }} placement="top" trigger={['click']}>
                        <Button type="dashed">添加步骤</Button>
                    </Dropdown>
                </div>
            </div>

            {addModalStatus == 'quote' && (
                <AddScriptModal
                    status={addModalStatus}
                    nodeTypeReverseMap={nodeTypeReverseMap}
                    onCancel={(flag, resTreeList, nodeInfo) => {
                        if (flag == 'success') {
                            handleAddNode(1, null, 0, resTreeList, nodeInfo);
                        }
                        setAddModalStatus('closed');
                    }}
                />
            )}

            {addModalStatus == 'copy' && (
                <CopyScriptModal
                    status={addModalStatus}
                    nodeTypeReverseMap={nodeTypeReverseMap}
                    onCancel={(flag, resTreeList, nodeInfo) => {
                        // if (flag == 'success') {
                        //     handleAddNode(1, null, 0, resTreeList, nodeInfo);
                        // }
                        setAddModalStatus('closed');
                    }}
                />
            )}
        </div>
    )
}

// export default TreeHandle;
export default connect(({ newScript, scriptManagement }) => ({
    newScript,
    scriptManagement
}))(TreeHandle);