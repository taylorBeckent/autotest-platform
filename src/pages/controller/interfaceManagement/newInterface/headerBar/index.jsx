import React, { useState, useRef, useEffect } from 'react';
import { LeftCircleOutlined } from '@ant-design/icons';
import { Button, message, Modal, Form, Row, Col, Select, Popover } from 'antd';
import { connect, history } from 'umi';
import './index.less';

const HeaderBar = (props) => {

    const {
        dispatch,
        actionMode,
        currentData,
        onLoading,
        nodeTypeReverseMap,
        scriptManagement: { caseInfo },
        interfaceManagement: { interfaceInfo, jsonData, xmlData, titleProtocalType }
    } = props;

    const [title, setTitle] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (actionMode == 'add') {
            setTitle('新增接口');
        } else if (actionMode == 'edit') {
            setTitle('编辑接口');
        } else if (actionMode == 'copy') {
            setTitle('复制接口');
        }
    }, []);

    //. 保存
    const handleSave = () => {
        //. 必输校验
        let validateFlag = handleValidate();
        if (!validateFlag) return;

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
            interfaceInfo.step_type = 'HTTP请求';

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
                    // message.error(`JSON格式有误，请修改后再进行调试`);
                }
            } else if (typeof (xmlData) == 'object') {
                interfaceInfo.request_text = xmlData ;
            } else {
                interfaceInfo.request_text = '';
            }
            interfaceInfo.step_type = 'TCP请求';

        }


        if (parseFlag == 'failed') return;

        interfaceInfo.step_no = 1;

        let caseInformation = {
            ...caseInfo,
            case_tags: [],
            // case_tags: tagListTransform(caseInfo?.case_tags),
            case_type: '公共接口',
            session_variables: []
        };
        onLoading('loading');
        dispatch({
            type: 'interfaceManagement/UpdateOrCreateTree',
            params: {
                case: caseInformation,
                steps: [interfaceInfo]
            },
            callback: (flag, res) => {
                if (flag == 'success' && !caseInfo?.case_id) {
                    let newCaseInfo = {
                        ...caseInfo,
                        case_id: res?.cases?.success_detail[0]?.case_id,
                        case_code: res?.cases?.success_detail[0]?.case_code
                    };

                    dispatch({
                        type: 'scriptManagement/syncCaseInfo',
                        caseInfo: newCaseInfo
                    })

                    searchVariables(res?.cases?.success_detail[0]?.case_id, res?.cases?.success_detail[0]?.case_code);

                    dispatch({
                        type: 'scriptManagement/StepTreeSearch',
                        params: {
                            case_id: res?.cases?.success_detail[0]?.case_id,
                            case_code: res?.cases?.success_detail[0]?.case_code
                        },
                        nodeTypeReverseMap,
                        callback: _ => {
                            onLoading('end');
                        }
                    })
                } else {
                    onLoading('end');
                }
            }
        })
    };

    //. 查询函数变量
    const searchVariables = (case_id, case_code) => {
        dispatch({
            type: 'scriptManagement/SessionVariables',
            params: {},
            callback: _ => { }
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

        // if (!caseInfo?.case_tags || caseInfo.case_tags.length == 0) {
        //     message.error('请选择标签');
        //     return;
        // }

        if (!interfaceInfo?.step_name) {
            message.error('请输入请求名称');
            return;
        }

        if (titleProtocalType == 'HTTP' && !interfaceInfo?.request_method) {
            message.error('请选择请求类型');
            return;
        }

        if (!interfaceInfo?.request_project_id) {
            message.error('请选择目标应用');
            return;
        }

        if (!interfaceInfo?.request_config_name) {
            message.error('请选择配置名称');
            return;
        }

        if (titleProtocalType == 'HTTP' && !interfaceInfo?.request_url) {
            message.error('请输入请求路径');
            return;
        }

        validateFlag = true;

        return validateFlag;
    };

    const goBack = () => {
        history.goBack();
    };

    return (
        <div className="header-container">
            <div className="title">
                <div style={{ cursor: 'pointer' }}>
                    <Button type="link" icon={<LeftCircleOutlined />} onClick={goBack}></Button>
                    <span onClick={goBack}>返回</span>
                </div>
                <div>|</div>
                <div>{title}</div>
            </div>
            <div className="action-bar">
                <Button type="primary" style={{ marginRight: 40 }} onClick={handleSave} >保存</Button>
            </div>
        </div>
    )
}

export default connect(({ scriptManagement, interfaceManagement }) => ({
    scriptManagement,
    interfaceManagement
}))(HeaderBar);