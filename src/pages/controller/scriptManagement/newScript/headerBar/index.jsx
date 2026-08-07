import React, { useState, useRef, useEffect } from 'react';
import { LeftCircleOutlined, BarsOutlined, CaretRightOutlined } from '@ant-design/icons';
import { Button, message, Modal, Form, Row, Col, Select, Popover, Dropdown, Divider, Space, Table } from 'antd';
import { connect, history } from 'umi';
import utils from '../../utils';
import styles from './index.less';
import EnvConfigModal from './envConfig';
import { databaseFieldMust, databaseFieldMustObj } from '@/pages/controller/common';

const { Option } = Select;

const HeaderBar = (props) => {

    const {
        dispatch,
        currentData,
        actionMode,
        onLoading,
        nodeTypeReverseMap,
        onRefreshDebugLog,
        scriptManagement: { stepTreeList, commonVariable, caseInfo, sceneNameList, selectedNode }
    } = props;

    const parseFlagRef = useRef('success'); //. json解析标志： 成功/失败

    const [dropForm] = Form.useForm();
    const [title, setTitle] = useState();

    const [dropdownStatus, setDropdownStatus] = useState(false); //. dropdown显隐
    const [useDataDriven, setUseDataDriven] = useState(); //. 是否使用测试数据
    const [sceneStatus, setSceneStatus] = useState(false); //. 数据驱动场景名称弹窗
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [sceneLoading, setSceneLoading] = useState(false); //. 数据驱动场景弹窗loading;

    const [envConfigStatus, setEnvConfigStatus] = useState('closed'); //. 环境改造弹窗
    const [finalList, setFinalList] = useState([]); //. 校验处理完成后的数据
    const [debugParams, setDebugParams] = useState({});

    const maxStepNo = useRef(0);


    useEffect(() => {
        if (actionMode == 'add') {
            setTitle('新增脚本');
        } else if (actionMode == 'edit') {
            setTitle('编辑脚本');
        } else if (actionMode == 'copy') {
            setTitle('复制脚本');
        }
    }, []);

    const sceneColumns = [
        {
            title: '序号',
            align: 'center',
            width: 80,
            render: (text, record, index) => {
                return <span>{index + 1}</span>
            }
        },
        {
            title: '数据集名称',
            key: 'dataSetName',
            dataIndex: 'dataSetName',
            align: 'left'
        },
    ];

    //. 深度遍历树结构
    const recurseTree = (treeList) => {
        if (!treeList || treeList.length == 0) return treeList;
        parseFlagRef.current = 'success';

        return treeList.map(item => {
            let copyItem = JSON.parse(JSON.stringify(item));

            if (copyItem?.request_body && typeof (copyItem?.request_body) == 'string') {
                try {
                    copyItem.request_body = JSON.parse(copyItem?.request_body);
                } catch (error) {
                    // setParseFlag(false);
                    parseFlagRef.current = 'failed';
                    message.error(`步骤：${copyItem.content} 下JSON格式有误，请修改后再进行调试`);
                }
            } else if (typeof (copyItem?.request_body) == 'object') {
                copyItem.request_body = copyItem?.request_body;
            } else {
                copyItem.request_body = {};
            }

            // if (copyItem.childNode && copyItem.childNode.length > 0) {
            //     copyItem.childNode = recurseTreeList(copyItem.childNode, newData);
            // }

            return copyItem;
        })
    };

    //. 标签值转换
    const tagListTransform = (tagList) => {
        let finalList = [];
        if (tagList && tagList.length > 0) {
            tagList.map(item => {
                finalList.push(item[1])
            })
        }

        return finalList;
    };

    //. 递归树结构，找到最大step_no (当前需求暂不考虑子节点，所以遍历就好，暂时不用递归)
    const recurseTreeFindMaxStepNo = (sourceList) => {
        sourceList.map(item => {
            if (item.step_no && item.step_no > maxStepNo.current) {
                maxStepNo.current = item.step_no;
            }
        })
    };

    //. 检查节点，给新增节点分配step_no
    const recurseTreeAndAddStepNo = (sourceList) => {
        if (sourceList && sourceList.length > 0) {
            return sourceList.map(item => {
                let copyItem = JSON.parse(JSON.stringify(item));

                maxStepNo.current++;
                copyItem.step_no = maxStepNo.current;

                return copyItem;
            })
        } else {
            return [];
        }
    };

    //. 必输性校验
    const handleValidate = () => {
        let validateFlag = false;
        if (!caseInfo?.case_name) {
            message.error('请输入脚本名称');
            return;
        }

        if (!caseInfo?.case_project) {
            message.error('请选择所属应用');
            return;
        }

        if (!caseInfo?.case_attr) {
            message.error('请选择案例类型');
            return;
        }

        if (!caseInfo?.case_tags || caseInfo.case_tags.length == 0) {
            message.error('请选择标签');
            return;
        }

        if (!caseInfo?.case_type) {
            message.error('请选择是否为公共脚本');
            return;
        }

        // 数据库操作中保存和调试前需要字段必输
        const checkDatabase = checkedDatabaseField(stepTreeList);
        if (!checkDatabase.valid) {
            message.error(`步骤 [${checkDatabase.step.step_name}] 中有未输入项: ${checkDatabase.field}`);
            return;
        }

        validateFlag = true;

        return validateFlag;
    };

    // 
    const checkedDatabaseField = (stepTreeL) => {
        const databaseStep = stepTreeL.filter(item => item.nodeType === 5).map(item => item);
        const noDatabase = databaseStep.filter(item => !item.hasOwnProperty("database_operates")) || [];
        if (noDatabase.length != 0) {
            return { valid: false, step: noDatabase[0] };
        }
        return findInvalid(databaseStep);
        // return databaseStep.every(item => item.database_operates.every(item => databaseFieldMust.every(field => item[field] != null && item[field] !== "")));
    }

    const findInvalid = (step) => {
        for (const op of step) {
            const databaseOperations = op.database_operates ?? [];
            for (const item of databaseOperations) {
                for (const field of databaseFieldMust) {
                    if (item[field] === null || item[field] === "") {
                        return { valid: false, step: op, field: databaseFieldMustObj[field] };
                    }
                }
                // select语句时要校验variable_name必输
                const sqlExpr = item?.expr;
                if (sqlExpr.includes("select") || sqlExpr.includes("SELECT")) {
                    if (item.variable_name === null || item.variable_name === "") {
                        return { valid: false, step: op, field: databaseFieldMustObj.variable_name };
                    }
                }
            }
        }
        return { valid: true, step: null };
    }

    //. 请求头中content-length校验
    const headerRemoveField = (sourceList) => {
        if (sourceList.length === 0) return [];
        sourceList.map(item => {
            if (item.step_type === "HTTP请求") {
                let newRequestHeader = []; //. 新请求头
                let curRequestHeader = Array.isArray(item.request_header) ? JSON.parse(JSON.stringify(item.request_header)) : []; //. 原请求头
                newRequestHeader = (curRequestHeader.length > 0) ? curRequestHeader.filter(cur => cur.key.toLowerCase() != 'content-length') : [];
                item.request_header = newRequestHeader;
            }
        });
        return sourceList;
    };

    // //. 遍历树结构，找到选中节点并更新
    const recurseAndUpdateSelectedNode = (treeList, selectedNode) => {
        if (!treeList || treeList.length == 0) return { 'treeList': treeList, 'reSelectedNode': selectedNode };

        let copyTreeList = JSON.parse(JSON.stringify(treeList));
        let curSelectedNode = JSON.parse(JSON.stringify(selectedNode)); //. 之前选中节点

        copyTreeList.forEach(item => {
            if (item.step_name == selectedNode.step_name) {
                item.isSelected = true;
                item.isHovered = true;
                curSelectedNode = item;
            }

            if (item.childNode && item.childNode.length > 0) {
                recurseAndUpdateSelectedNode(item.childNode, selectedNode);
            }
        })

        return { 'treeList': copyTreeList, 'reSelectedNode': curSelectedNode };
    };

    //. 回退
    const goBack = () => {
        dispatch({
            type: 'scriptManagement/syncCommonVariable',
            commonVariable: []
        })
        history.goBack();
    };

    //. 保存脚本
    const handleSave = () => {
        let stepList = stepTreeList.filter(item => item.step_type !== '用户变量');
        // recurseTreeFindMaxStepNo(stepList); //. 找到最大step_no

        //. 必输校验
        let validateFlag = handleValidate();
        if (!validateFlag) return;

        if (stepList.length == 0) {
            message.error('脚本步骤不能为空，请添加步骤');
            return;
        }

        // let 

        //. 步骤名称重复校验
        let stepTree = JSON.parse(JSON.stringify(stepList));
        const validateMsg = utils.stepValidateCheck(stepTree);
        if (validateMsg.length > 0) {
            message.error(validateMsg);
            return;
        }

        const duplicateList = utils.duplicateStepNameCheck(stepTree);
        if (duplicateList.length > 0) {
            message.error(`步骤树中存在相同步骤名：${duplicateList.toString()} 请检查`);
            return;
        }

        let addStepNoList = recurseTreeAndAddStepNo(stepList); //. 添加step_no

        maxStepNo.current = 0;

        let parseJsonStepList = recurseTree(addStepNoList); //. 解析JSON对象
        let argumentStepList = headerRemoveField(parseJsonStepList); //. 去除数组中的content-length
        let caseInformation = {
            ...caseInfo,
            case_tags: tagListTransform(caseInfo?.case_tags),
            session_variables: commonVariable
        };

        onLoading('loading');
        dispatch({
            type: 'scriptManagement/UpdateOrCreateTree',
            params: {
                case: caseInformation,
                steps: argumentStepList,
            },
            callback: (flag, res) => {
                if (flag == 'success') {
                    if (!caseInfo?.case_id) {
                        let newCaseInfo = {
                            ...caseInfo,
                            case_id: res?.cases?.success_detail[0]?.case_id,
                            case_code: res?.cases?.success_detail[0]?.case_code
                        }
                        dispatch({
                            type: 'scriptManagement/syncCaseInfo',
                            caseInfo: newCaseInfo
                        })

                        searchVariables(res?.cases?.success_detail[0]?.case_id, res?.cases?.success_detail[0]?.case_code); //. 查询变量函数;
                    }

                    dispatch({
                        type: 'scriptManagement/StepTreeReSearch',
                        params: {
                            case_id: res?.cases?.success_detail[0]?.case_id,
                            case_code: res?.cases?.success_detail[0]?.case_code
                        },
                        nodeTypeReverseMap,
                        callback: (flag, resTreeList) => {
                            if (flag === 'success') {
                                let reFreshStepInfo = recurseAndUpdateSelectedNode(resTreeList, selectedNode);
                                dispatch({
                                    type: 'scriptManagement/syncStepTreeList',
                                    stepTreeList: reFreshStepInfo.treeList
                                })

                                dispatch({
                                    type: 'scriptManagement/syncSelectedNode',
                                    selectedNode: reFreshStepInfo.reSelectedNode
                                })
                            }

                            onLoading('end');
                        }
                    })
                } else {
                    onLoading('end');
                }
            }
        })
    };

    //. 全量调试
    const handleDebug = () => {
        let stepList = stepTreeList.filter(item => item.step_type != '用户变量'); //. 去除用户变量的部分

        //. 必输校验
        let validateFlag = handleValidate();
        if (!validateFlag) return;

        if (stepList.length == 0) {
            message.error('脚本步骤不能为空，请添加步骤');
            return;
        }

        //. 步骤名称重复校验
        let stepTree = JSON.parse(JSON.stringify(stepList));

        const validateMsg = utils.stepValidateCheck(stepTree);
        if (validateMsg.length > 0) {
            message.error(validateMsg);
            return;
        }

        const duplicateList = utils.duplicateStepNameCheck(stepTree);
        if (duplicateList.length > 0) {
            message.error(`步骤树中存在相同步骤名：${duplicateList.toString()} 请检查`);
            return;
        }

        // recurseTreeFindMaxStepNo(stepList); //. 找到最大step_no

        let addStepNoList = recurseTreeAndAddStepNo(stepList); //. 添加step_no
        maxStepNo.current = 0;
        let parseJsonStepList = recurseTree(addStepNoList); //. 解析并校验每个节点的json对象
        if (parseFlagRef.current != 'success') return;

        let argumentStepList = headerRemoveField(parseJsonStepList); //. 去除数组中的content-length

        let params = {
            case_id: caseInfo?.case_id,
            initial_variables: commonVariable,
            steps: argumentStepList,
        };
        if (dropForm.getFieldValue('useDataDriven') === '是') params.selected_dataset_names = selectedRowKeys;

        setDebugParams(params);
        setFinalList(argumentStepList);
        setSceneStatus(false);
        setEnvConfigStatus('open'); //. 环境配置弹窗打开
    };

    //. 是否使用测试数据Change
    const useDataDrivenChange = (e) => {
        if (e == "是") {
            setSceneStatus(true);
            setSelectedRowKeys([]);
            setDropdownStatus(false);

            setSceneLoading(true);
            dispatch({
                type: 'scriptManagement/QueryNames',
                params: {
                    case_id: caseInfo?.case_id
                },
                callback: _ => {
                    setSceneLoading(false);
                }
            })
        }
    };

    const handleOpenChange = (openStatus) => {
        setDropdownStatus(openStatus);
        // openStatus && dropForm.setFieldValue('useDataDriven', '否');
    };

    const DropdownRender = (menu) => (
        <div className={styles['dropdown-content']}>
            <Form form={dropForm} layout="vertical">
                <Row>
                    <Col span={24}>
                        <Form.Item label="是否使用测试数据" name="useDataDriven"
                            rules={[{ required: true, message: "请选择是否使用测试数据" }]}
                            initialValue="否"
                        >
                            <Select
                                allowClear
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="请选择是否使用测试数据"
                                onChange={useDataDrivenChange}
                            >
                                <Option key="是" value="是" >是</Option>
                                <Option key="否" value="否" >否</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

            </Form>
        </div>
    );

    //. 查询函数变量
    const searchVariables = (case_id, case_code) => {
        dispatch({
            type: 'scriptManagement/SessionVariables',
            params: { case_id, case_code },
            callback: _ => { }
        })
    };

    return (
        <div className={styles['header-container']}>
            <div className={styles['title']}>
                <div style={{ cursor: 'pointer' }}>
                    <Button type="link" icon={<LeftCircleOutlined />} onClick={goBack} ></Button>
                    <span onClick={goBack}>返回</span>
                </div>
                <div>|</div>
                <div>{title}</div>
            </div>
            <div className={styles['action-bar']}>
                <Button type="primary" style={{ marginRight: 10 }} onClick={handleSave} >保存</Button>
                {(caseInfo?.case_id) ?
                    (<Dropdown.Button
                        trigger={['click']} type="primary" style={{ marginRight: 10 }} icon={<BarsOutlined />}
                        open={dropdownStatus}
                        onOpenChange={handleOpenChange}
                        overlay={DropdownRender}
                        onClick={() => { handleDebug() }}
                    >
                        <CaretRightOutlined />脚本调试
                    </Dropdown.Button>)

                    : <Popover content="请先保存脚本">
                        <Button type="primary" style={{ marginRight: 10 }} disabled >脚本调试</Button>
                    </Popover>
                }
            </div>

            <Modal
                title="选择测试数据"
                visible={sceneStatus}
                width={500}
                maskClosable={false}
                onCancel={() => { setSceneStatus(false) }}
                footer={[
                    <>
                        <Button onClick={() => { setSceneStatus(false) }} >取消</Button>
                        <Button type="primary" onClick={handleDebug} >确认</Button>
                    </>
                ]}
            >
                <div className={styles['scene-modal']}>
                    <Table
                        loading={sceneLoading}
                        columns={sceneColumns}
                        dataSource={sceneNameList}
                        rowKey="dataSetName"
                        rowSelection={{
                            type: 'radio',
                            selectedRowKeys,
                            onChange: (keys, rows) => setSelectedRowKeys(keys),
                        }}
                        pagination={false}
                    />

                    <div className={styles['data-scene-select']} >已选 {selectedRowKeys.length} 项</div>
                </div>
            </Modal>

            {envConfigStatus !== 'closed' && (
                <EnvConfigModal
                    status={envConfigStatus}
                    finalList={finalList}
                    debugParams={debugParams}
                    onRefreshDebugLog={onRefreshDebugLog}
                    onCancel={_ => {
                        setEnvConfigStatus('closed');
                        // setSceneStatus(false);
                    }}
                />
            )}
        </div>
    )
}

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(HeaderBar);