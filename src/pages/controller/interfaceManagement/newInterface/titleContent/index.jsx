import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Input, Select, Radio, Cascader, Popover } from 'antd';
import { connect } from 'umi';
import styles from './index.less';
import { QuestionCircleOutlined } from '@ant-design/icons';

const TitleContent = (props) => {

    const {
        dispatch,
        currentData,
        actionMode,
        nodeTypeReverseMap,
        scriptManagement: { applicationList, cascaderTagsList, caseInfo },
        interfaceManagement: { interfaceInfo, titleProtocalType }
    } = props;
    const { Option } = Select;
    const { TextArea } = Input;
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue({
            scriptName: currentData?.case_name,
            project: currentData?.case_project?.project_id,
            caseAttr: currentData?.case_attr,
            isPublicScript: currentData?.case_type === "公共接口" ? "1" : "2",
            description: currentData?.case_desc,
        })

        if (currentData.case_tags && currentData.case_tags.length > 0) {
            applicationChange(currentData?.case_project?.project_id)
        }

        dispatch({
            type: 'scriptManagement/GetEffectiveApp',
            params: {
                page: 1,
                page_size: 9999
            },
        });

    }, []);

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

    //. 应用Change
    const applicationChange = (value) => {
        updateCaseInfo('case_project', value);
        if (value) {
            dispatch({
                type: 'scriptManagement/TagSearchCascader',
                params: {
                    tag_project: value,
                    tag_type: '接口',
                    page: 1,
                    page_size: 999
                },
                callback: flag => {
                    if (flag == 'success') {
                        // let selectTagList = currentData?.case_tags ? transformTagData(currentData.case_tags) : [];
                        // form.setFieldsValue({ 'tags': selectTagList })
                    }
                }
            })
        }
    };

    //. 案例类型Change
    const caseAttrChange = (e) => {
        updateCaseInfo('case_attr', e.target.value);
    };

    //. 标签change
    const selectedTargetChange = (e) => {
        // let tagList = transformTagData(e);
        updateCaseInfo('case_tags', e);
    };

    //. 数据格式转换
    const transformTagData = (sourceData) => {
        let finalArr = [];
        sourceData.map(item => {
            let arr = [];
            arr.push(item.tag_mode);
            arr.push(item.tag_id);
            finalArr.push(arr);
        });
        return finalArr;
    };

    //. 更新数据
    const updateCaseInfo = (field, value) => {
        dispatch({
            type: 'scriptManagement/syncCaseInfo',
            caseInfo: {
                ...caseInfo,
                [field]: value
            }
        })
    };
    const publicScriptTitleRender = (
        <div>
            <Popover content={<div>
                <div>TCP协议目前只支持短连接方式 </div>
            </div>}>
                <QuestionCircleOutlined style={{ marginRight: 5, cursor: 'pointer', color: '#1890ff' }} />
            </Popover>
            协议类型
        </div>
    );
    return (
        <div className={styles['title-content']}>
            <Form form={form}>
                <Row>
                    <Col span={8} className={styles['row-content']}>
                        <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="接口名称" name="scriptName"
                            rules={[{ required: true, message: "请输入接口名称" }]}
                        >
                            <TextArea
                                autoSize={{ minRows: 1, maxRows: 4 }}
                                placeholder="请输入接口名称"
                                onChange={e => {
                                    updateCaseInfo('case_name', e.target.value)
                                }}
                            />
                        </Form.Item>
                    </Col>

                    {/* <Col span={1}></Col> */}

                    <Col span={8} className={styles['row-content']}>
                        <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="所属应用" name="project"
                            rules={[{ required: true, message: "请选择所属应用" }]}
                        >
                            <Select
                                showSearch
                                placeholder="请选择所属应用"
                                optionFilterProp='children'
                                onChange={applicationChange}
                            >
                                {applicationList.length > 0 && applicationList.map(item => (
                                    <Option key={item.project_id} value={item.project_id} >{item.project_name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8} className={styles['row-content']}>
                        <Form.Item
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 16 }}
                            label={publicScriptTitleRender}
                            name="protocalType"
                            rules={[{ required: true, message: "请选择协议类型" }]}
                            initialValue={titleProtocalType}
                        >
                            <Select
                                showSearch
                                placeholder="请选择协议类型"
                                optionFilterProp='children'
                                onChange={(e) => {
                                    dispatch({
                                        type: 'interfaceManagement/syncTitleProtocalType',
                                        titleProtocalType: e
                                    })
                                }}
                            >
                                <Option key='HTTP' value='HTTP' >HTTP</Option>
                                <Option key='TCP' value='TCP' >TCP</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row style={{ marginTop: 15 }}>
                    {/* <Col span={8} >
                        <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="标签" name="tags"
                            rules={[{ required: true, message: "请选择标签" }]}
                        >
                            <Cascader
                                style={{ width: '100%' }}
                                options={cascaderTagsList}
                                multiple
                                maxTagCount='responsive'
                                maxTagTextLength={3}
                                showCheckedStrategy={Cascader.SHOW_CHILD}
                                placeholder="请选择标签"
                                onChange={selectedTargetChange}
                            />
                        </Form.Item>
                    </Col> */}
                    <Col span={8} className={styles['row-content']}>
                        <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="接口描述" name="description" >
                            <TextArea
                                autoSize={{ minRows: 1, maxRows: 6 }}
                                rows={1}
                                placeholder="请输入接口描述"
                                onChange={e => {
                                    updateCaseInfo('case_desc', e.target.value)
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}

export default connect(({ scriptManagement, interfaceManagement }) => ({
    scriptManagement,
    interfaceManagement
}))(TitleContent);