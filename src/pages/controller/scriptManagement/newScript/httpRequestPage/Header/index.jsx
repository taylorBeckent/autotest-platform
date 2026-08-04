import React, { useEffect, useState } from 'react';
import { Select, Input, Button, Row, Col, message, Modal, Form, Popover } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import utils from '../../../utils';
import { connect } from 'umi';
import styles from './index.less';
const { Option } = Select;

const HttpHeader = (props) => {
    const {
        dispatch,
        scriptManagement: { selectedNode, stepTreeList, applicationList, commonVariable, configList }
    } = props;

    const [requestType, setRequestType] = useState(); //. 请求类型
    const [targetProjectId, setTargetProjectId] = useState(); //. 所属系统value
    const [configName, setConfigName] = useState(); //. 配置名称
    const [requestPath, setRequestPath] = useState(); //. 请求路径
    const [requestName, setRequestName] = useState(); //. 请求名称

    const [debugModalStatus, setDebugModalStatus] = useState('closed'); //. 调试环境弹窗
    const [modalForm] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const [envList, setEnvList] = useState([]);

    useEffect(() => {
        selectedNode?.request_method ? setRequestType(selectedNode?.request_method) : setRequestType();
        selectedNode?.request_url ? setRequestPath(selectedNode?.request_url) : setRequestPath();
        selectedNode?.content ? setRequestName(selectedNode?.content) : setRequestName();
        selectedNode?.request_config_name ? setConfigName(selectedNode?.request_config_name) : setConfigName();
        if (selectedNode?.request_project_id) {
            setTargetProjectId(selectedNode?.request_project_id);
            dispatch({
                type: 'scriptManagement/GetConfigNames',
                params: {
                    project_id: selectedNode?.request_project_id
                },
                callback: _ => { }
            });
            dispatch({
                type: 'scriptManagement/GetEnvNames',
                params: {
                    project_id: [selectedNode?.request_project_id]
                },
                callback: (flag, resData) => {
                    let envArr = (flag === 'success' && Array.isArray(resData[selectedNode?.request_project_id]['APP']) && resData[selectedNode?.request_project_id]['APP'].length > 0) ? resData[selectedNode?.request_project_id]['APP'] : [];
                    setEnvList(envArr);
                }
            });
        } else {
            setTargetProjectId();
        }
    }, [selectedNode]);

    //. 步骤名称change
    const requestNameChange = (e) => {
        setRequestName(e.target.value);

        let insertList = [
            { insertKey: 'content', insertValue: e.target.value },
            { insertKey: 'step_name', insertValue: e.target.value }
        ];
        updateTreeList(insertList);

        // let newSelectedNode = JSON.parse(JSON.stringify(selectedNode));
        selectedNode['content'] = e.target.value;
        selectedNode['step_name'] = e.target.value;
        // dispatch({
        //     type: 'scriptManagement/syncSelectedNode',
        //     selectedNode: { ...selectedNode, content: e.target.value, step_name: e.target.value }
        // })
    };

    //. 调试应用change
    const applicationChange = (e) => {
        setTargetProjectId(e);

        let insertList = [
            { insertKey: 'request_project_id', insertValue: e },
            { insertKey: 'request_config_name', insertValue: undefined }
        ];
        updateTreeList(insertList);
        setConfigName(undefined);

        dispatch({
            type: 'scriptManagement/GetConfigNames',
            params: {
                project_id: e
            },
            callback: _ => { }
        });

        dispatch({
            type: 'scriptManagement/GetEnvNames',
            params: {
                project_id: [e]
            },
            callback: (flag, resData) => {
                let envArr = (flag === 'success' && Array.isArray(resData[e]['APP']) && resData[e]['APP'].length > 0) ? resData[e]['APP'] : [];
                setEnvList(envArr);
            }
        });
    };

    //. 配置名称change
    const configNameChange = (e) => {
        setConfigName(e);

        updateTreeList([{ insertKey: 'request_config_name', insertValue: e }]);
    };

    //. 请求方式change 
    const requestTypeChange = (e) => {
        setRequestType(e);

        updateTreeList([{ insertKey: 'request_method', insertValue: e }]);
    };

    //. 请求路径change
    const requestPathChange = (e) => {
        setRequestPath(e.target.value);

        updateTreeList([{ insertKey: 'request_url', insertValue: e.target.value }]);
    };

    const updateTreeList = (insertList) => {
        let finalList = utils.recurseTreeList(stepTreeList, insertList, selectedNode);

        dispatch({
            type: 'scriptManagement/syncStepTreeList',
            stepTreeList: finalList
        });
    };

    //. 打开调试弹窗
    const openDebugModal = () => {
        if (selectedNode.nodeType == '2' && !requestType) {
            message.error('请选择请求方式');
            return;
        }

        if (!targetProjectId) {
            message.error('请选择调试应用');
            return;
        }

        if (!configName) {
            message.error('请选择配置名称');
            return;
        }

        if (selectedNode.nodeType == '2' && !requestPath) {
            message.error('请输入请求url路径');
            return;
        }

        if (!requestName) {
            message.error('请输入请求名称');
            return;
        }

        setDebugModalStatus('open');
    };

    //. 请求头中content-length校验
    const headerRemoveField = (currentRecord) => {
        let newRequestHeader = []; //. 新请求头
        let curRequestHeader = (Array.isArray(currentRecord.request_header) && currentRecord.request_header.length > 0) ? JSON.parse(JSON.stringify(currentRecord.request_header)) : []; //. 原请求头
        newRequestHeader = (Array.isArray(curRequestHeader) && curRequestHeader.length > 0) ? curRequestHeader.filter(cur => cur.key.toLowerCase() != 'content-length') : [];
        currentRecord.request_header = newRequestHeader;
    };

    //. 开始调试
    const handleDebugging = () => {
        modalForm.validateFields().then(() => {
            let requestJsonData = {};
            let requestXmlData = '';
            let stepTreeListCopy = JSON.parse(JSON.stringify(stepTreeList));
            let currentRow = stepTreeListCopy.filter(item => item.id === selectedNode.id)[0];
            if (selectedNode.nodeType == '2') {
                if (typeof (currentRow?.request_body) === 'object') {
                    requestJsonData = currentRow?.request_body;
                } else if (typeof (currentRow?.request_body) === 'string') {
                    try {
                        requestJsonData = JSON.parse(currentRow?.request_body);
                    } catch (error) {
                        message.error('json类型格式错误，请检查');
                        return;
                    }
                }
            }
            if (selectedNode.nodeType == '4') {
                if (typeof (currentRow?.request_body) === 'object') {
                    requestJsonData = currentRow?.request_body;
                } else if (typeof (currentRow?.request_body) === 'string') {
                    try {
                        requestJsonData = JSON.parse(currentRow?.request_body);
                    } catch (error) {
                        message.error('json类型格式错误，请检查');
                        return;
                    }
                }
                if (typeof (currentRow?.request_text) === 'object') {
                    requestXmlData = currentRow?.request_text;
                } else if (typeof (currentRow?.request_text) === 'string') {
                    try {
                        requestXmlData = currentRow?.request_text;
                    } catch (error) {
                        message.error('xml类型格式错误，请检查');
                        return;
                    }
                }
            }


            headerRemoveField(currentRow); //. 过滤请求头中content-length;

            currentRow.request_body = requestJsonData || {};
            currentRow.request_text = requestXmlData || '';
            currentRow.env_name = modalForm.getFieldValue('env');
            currentRow.request_config_name = configName;
            currentRow.session_variables = commonVariable;

            setLoading(true);
            if (selectedNode.nodeType == '2') {
                dispatch({
                    type: 'scriptManagement/HttpDebugging',
                    params: currentRow,
                    callback: _ => {
                        setDebugModalStatus('closed');
                        setLoading(false);
                    }
                });
            }
            if (selectedNode.nodeType == '4') {
                dispatch({
                    type: 'scriptManagement/TcpDebugging',
                    params: currentRow,
                    callback: _ => {
                        setDebugModalStatus('closed');
                        setLoading(false);
                    }
                });
            }

        }).catch(error => {
            throw error
        })
    };

    return (
        <div className={styles['http-content']}>
            <Row style={{ alignItems: 'center', marginBottom: 15 }} >
                <Col span={3}>
                    <label>请求名称：</label>
                </Col>
                <Col span={8}>
                    <Input
                        placeholder="请输入请求名称"
                        value={requestName}
                        onChange={requestNameChange}
                        disabled={selectedNode?.isQuote}
                    />
                </Col>
            </Row>
            <div className={styles['first-row']}>
                <Row>
                    {selectedNode.nodeType == '2' ? <Col span={3}>
                        <Select
                            style={{ width: '100%' }}
                            value={requestType}
                            onChange={requestTypeChange}
                            placeholder="请选择请求类型"
                            disabled={selectedNode?.isQuote}
                            optionFilterProp='children'
                        >
                            <Option key="POST" value="POST" >POST</Option>
                            <Option key="GET" value="GET" >GET</Option>
                            <Option key="PUT" value="PUT" >PUT</Option>
                            <Option key="DELETE" value="DELETE" >DELETE</Option>
                        </Select>
                    </Col> : <Col span={3}></Col>}
                    <Col span={6}>
                        <Select
                            allowClear
                            showSearch
                            style={{ width: '100%' }}
                            value={targetProjectId}
                            onChange={applicationChange}
                            placeholder="目标应用"
                            disabled={selectedNode?.isQuote}
                            optionFilterProp='children'
                        >
                            {applicationList.length > 0 && applicationList.map(item => (
                                <Option key={item.project_id} value={item.project_id} >{item.project_name}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={6}>
                        <Select
                            showSearch
                            style={{ width: '100%' }}
                            value={configName}
                            onChange={configNameChange}
                            placeholder="配置名称"
                            disabled={selectedNode?.isQuote}
                            optionFilterProp='children'
                        >
                            {configList.length > 0 && configList.map(item => (
                                <Option key={item} value={item} >{item}</Option>
                            ))}
                        </Select>
                    </Col>
                    {selectedNode.nodeType == '2' ? <Col span={8}>
                        <Input
                            placeholder="请输入请求路径"
                            value={requestPath}
                            onChange={requestPathChange}
                            disabled={selectedNode?.isQuote}
                        />
                    </Col> : null}

                    <Popover content="单步调试" >
                        {selectedNode?.isQuote ?
                            <PlayCircleOutlined style={{ marginLeft: 8, color: '#aba6a6', cursor: 'not-allowed', fontSize: 19 }} />
                            : <PlayCircleOutlined style={{ marginLeft: 8, color: '#409eff', fontSize: 19 }} onClick={openDebugModal} />
                        }
                    </Popover>
                </Row>
            </div>

            <Modal
                title="单步调试"
                visible={debugModalStatus !== 'closed'}
                width={500}
                maskClosable={false}
                onCancel={() => { setDebugModalStatus('closed') }}
                footer={[
                    <>
                        <Button type="primary" onClick={handleDebugging} loading={loading} >单步调试</Button>
                    </>
                ]}
            >
                <Form form={modalForm}>
                    <Row>
                        <Col span={1}></Col>
                        <Col span={20}>
                            <Form.Item labelCol={{ span: 3 }} wrapperCol={{ span: 24 }} label="环境" name="env"
                                rules={[{ required: true, message: "请选择调试环境" }]}
                            >
                                <Select
                                    allowClear
                                    showSearch
                                    style={{ width: '100%' }}
                                    placeholder="请选择调试环境"
                                >
                                    {envList.length > 0 && envList.map(item => (
                                        <Option key={item} value={item}>{item}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    )
};

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(HttpHeader);