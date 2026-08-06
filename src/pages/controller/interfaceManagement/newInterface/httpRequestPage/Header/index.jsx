import React, { useEffect, useState } from 'react';
import { Select, Input, Button, Row, Col, message, Modal, Form } from 'antd';
import { connect } from 'umi';
import styles from './index.less';
import { log } from 'lodash-decorators/utils';

const { Option } = Select;

const HttpHeader = (props) => {
    const {
        dispatch,
        scriptManagement: { caseInfo, stepTreeList, applicationList, configList },
        interfaceManagement: { interfaceInfo, jsonData, titleProtocalType, xmlData }
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
        stepTreeList[1]?.request_method ? setRequestType(stepTreeList[1]?.request_method) : setRequestType();
        stepTreeList[1]?.request_url ? setRequestPath(stepTreeList[1]?.request_url) : setRequestPath();
        stepTreeList[1]?.request_config_name ? setConfigName(stepTreeList[1]?.request_config_name) : setConfigName();

    }, [stepTreeList]);

    useEffect(() => {
        if (caseInfo.case_name) {
            setRequestName(caseInfo.case_name);
            updateInterfaceInfo('step_name', caseInfo.case_name);
        }
    }, [caseInfo.case_name])

    useEffect(() => {
        caseInfo.case_project && applicationChange(caseInfo.case_project);
    }, [caseInfo.case_project])

    //. 步骤名称change
    const requestNameChange = (e) => {
        setRequestName(e.target.value);

        updateInterfaceInfo('step_name', e.target.value);
    };

    //. 调试应用change
    const applicationChange = (e) => {
        setTargetProjectId(e);

        let insertList = [
            { insertKey: 'request_project_id', insertValue: e },
            { insertKey: 'request_config_name', insertValue: undefined }
        ];
        batchUpdateInterfaceInfo(insertList);

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

    //. 调试应用change
    const configNameChange = (e) => {
        setConfigName(e);

        updateInterfaceInfo('request_config_name', e);
    };

    //. 请求方式change 
    const requestTypeChange = (e) => {
        setRequestType(e);

        updateInterfaceInfo('request_method', e);
    };

    //. 请求路径change
    const requestPathChange = (e) => {
        setRequestPath(e.target.value);

        updateInterfaceInfo('request_url', e.target.value);
    };

    //. 更新数据
    const updateInterfaceInfo = (field, value) => {
        dispatch({
            type: 'interfaceManagement/syncInterfaceInfo',
            interfaceInfo: {
                ...interfaceInfo,
                [field]: value
            }
        })
    };

    //. 批量更新数据
    const batchUpdateInterfaceInfo = (insertList) => {
        const templateInfo = insertList.reduce((acc, item) => ({
            ...acc,
            [item.insertKey]: item.insertValue
        }), { ...interfaceInfo });

        dispatch({
            type: 'interfaceManagement/syncInterfaceInfo',
            interfaceInfo: templateInfo
        })
    };

    //. 请求头中content-length校验
    const headerRemoveField = (currentRecord) => {
        let newRequestHeader = []; //. 新请求头
        let curRequestHeader = (Array.isArray(currentRecord.request_header) && currentRecord.request_header.length > 0) ? JSON.parse(JSON.stringify(currentRecord.request_header)) : []; //. 原请求头
        newRequestHeader = (Array.isArray(curRequestHeader) && curRequestHeader.length > 0) ? curRequestHeader.filter(cur => cur.key.toLowerCase() != 'content-length') : [];
        currentRecord.request_header = newRequestHeader;
    };

    //. 打开调试弹窗
    const openDebugModal = () => {
        if (titleProtocalType == 'HTTP' && !requestType) {
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

        if (titleProtocalType == 'HTTP' && !requestPath) {
            message.error('请输入请求url路径');
            return;
        }

        if (!requestName) {
            message.error('请输入请求名称');
            return;
        }

        setDebugModalStatus('open');
    };

    //. 开始调试
    const handleDebugging = () => {
        modalForm.validateFields().then(() => {
            //. 解析json格式校验
            let parseFlag = 'success';  //. json解析标志： 成功/失败
            if (titleProtocalType == 'HTTP') {
                if (jsonData && typeof (jsonData) == 'string') {
                    try {
                        interfaceInfo.request_body = JSON.parse(jsonData);
                    } catch (error) {
                        parseFlag = 'failed';
                        message.error(`JSON格式有误，请修改后再进行调试`);
                    }
                } else if (typeof (jsonData) == 'object') {
                    interfaceInfo.request_body = jsonData;
                } else {
                    interfaceInfo.request_body = {};
                }

                if (parseFlag == 'failed') return;

                interfaceInfo.step_no = 1;
                interfaceInfo.step_type = 'HTTP请求';
                interfaceInfo.env_name = modalForm.getFieldValue('env');
                // interfaceInfo.request_config_name = configName;

                headerRemoveField(interfaceInfo); //. 过滤请求头中content-length;

                setLoading(true);
                dispatch({
                    type: 'scriptManagement/HttpDebugging',
                    params: interfaceInfo,
                    callback: _ => {
                        setLoading(false);
                        setDebugModalStatus('closed');
                    }
                });
            }
            if (titleProtocalType == 'TCP') {
                if (jsonData && typeof (jsonData) == 'string') {
                    try {
                        interfaceInfo.request_body = JSON.parse(jsonData);
                    } catch (error) {
                        parseFlag = 'failed';
                        message.error(`JSON格式有误，请修改后再进行调试`);
                    }
                } else if (typeof (jsonData) == 'object') {
                    interfaceInfo.request_body = jsonData;
                } else {
                    interfaceInfo.request_body = {};
                }
                if (xmlData && typeof (xmlData) == 'string') {
                    try {
                        interfaceInfo.request_text = xmlData;
                    } catch (error) {
                        parseFlag = 'failed';
                        message.error(`JSON格式有误，请修改后再进行调试`);
                    }
                } else if (typeof (xmlData) == 'object') {
                    interfaceInfo.request_text = jsonData;
                } else {
                    interfaceInfo.request_text = '';
                }

                if (parseFlag == 'failed') return;

                interfaceInfo.step_no = 1;
                interfaceInfo.step_type = 'TCP请求';
                interfaceInfo.env_name = modalForm.getFieldValue('env');
                interfaceInfo.request_project_id = caseInfo?.case_project;
                // interfaceInfo.request_config_name = configName;

                headerRemoveField(interfaceInfo); //. 过滤请求头中content-length;

                setLoading(true);
                dispatch({
                    type: 'scriptManagement/TcpDebugging',
                    params: interfaceInfo,
                    callback: _ => {
                        setLoading(false);
                        setDebugModalStatus('closed');
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
                        disabled
                        placeholder="请输入请求名称"
                        value={requestName}
                        onChange={requestNameChange}
                    />
                </Col>
            </Row>

            <div className={styles['first-row']}>
                <Row>
                    {titleProtocalType == 'HTTP' ? <Col span={3}>
                        <Select
                            style={{ width: '100%' }}
                            value={requestType}
                            onChange={requestTypeChange}
                            placeholder="请选择请求类型"
                        >
                            <Option key="POST" value="POST" >POST</Option>
                            <Option key="GET" value="GET" >GET</Option>
                            <Option key="PUT" value="PUT" >PUT</Option>
                            <Option key="DELETE" value="DELETE" >DELETE</Option>
                        </Select>
                    </Col> : <Col span={3}></Col>}
                    <Col span={4}>
                        <Select
                            disabled
                            allowClear
                            showSearch
                            style={{ width: '100%' }}
                            value={targetProjectId}
                            onChange={applicationChange}
                            placeholder="目标应用"
                            optionFilterProp='children'
                        >
                            {applicationList.length > 0 && applicationList.map(item => (
                                <Option key={item.project_id} value={item.project_id} >{item.project_name}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            showSearch
                            style={{ width: '100%' }}
                            value={configName}
                            onChange={configNameChange}
                            placeholder="配置名称"
                        >
                            {configList.length > 0 && configList.map(item => (
                                <Option key={item} value={item} >{item}</Option>
                            ))}
                        </Select>
                    </Col>
                    {titleProtocalType == 'HTTP' ? <Col span={9}>
                        <Input
                            placeholder="请输入请求路径"
                            value={requestPath}
                            onChange={requestPathChange}
                        />
                    </Col> : null}
                    <Button type="primary" style={{ marginLeft: 10 }} onClick={openDebugModal} >调试</Button>
                </Row>
            </div>

            <Modal
                title="调试"
                visible={debugModalStatus !== 'closed'}
                width={500}
                maskClosable={false}
                onCancel={() => { setDebugModalStatus('closed') }}
                footer={[
                    <>
                        <Button type="primary" loading={loading} onClick={handleDebugging} >调试</Button>
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

export default connect(({ scriptManagement, interfaceManagement }) => ({
    scriptManagement,
    interfaceManagement
}))(HttpHeader);
// export default HttpHeader;