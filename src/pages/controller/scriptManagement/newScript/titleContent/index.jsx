import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Input, Select, Radio, Cascader, Popover, Modal } from 'antd';
import { QuestionCircleOutlined, TagsOutlined } from '@ant-design/icons';
import { connect } from 'umi';
import styles from './index.less';
import utils from '../../utils';

const TitleContent = (props) => {

    const {
        dispatch,
        currentData,
        actionMode,
        nodeTypeMap,
        nodeTypeReverseMap,
        scriptManagement: { applicationList, cascaderTagsList, caseInfo, stepTreeList, stepTreeMiddleList }
    } = props;

    const { Option } = Select;
    const { TextArea } = Input;
    const [form] = Form.useForm();

    const [radioValue, setRadioValue] = useState();
    const [tagsValue, setTagsValue] = useState([]);

    const caseTypeMap = {
        "公共脚本": "1",
        "用户脚本": "2"
    }

    useEffect(() => {
        form.setFieldsValue({
            scriptName: currentData?.case_name,
            project: currentData?.case_project?.project_id,
            caseAttr: currentData?.case_attr,
            isPublicScript: currentData?.case_type && caseTypeMap[currentData?.case_type],
            description: currentData?.case_desc,
        })

        currentData?.case_type && setRadioValue(caseTypeMap[currentData?.case_type]);

        if (currentData.case_tags && currentData.case_tags.length > 0) {
            applicationChange(currentData?.case_project?.project_id, 'init')
        }

        dispatch({
            type: 'scriptManagement/GetEffectiveApp',
            params: {
                page: 1,
                page_size: 9999
            },
        });


        handleQueryEnvApps();
    }, []);

    // 新增的环境管理查询ATPM应用
    const handleQueryEnvApps = () => {
        dispatch({
            type: 'scriptManagement/QueryEnvApps',
            payload: { page: 1, page_size: 10000, }
        });
    };

    //. 应用Change
    const applicationChange = (value, type) => {
        let insertList = [
            { insertKey: 'case_tags', insertValue: undefined },
            { insertKey: 'case_project', insertValue: value }
        ]
        batchUpdateInterfaceInfo(insertList);

        if (value) {
            dispatch({
                type: 'scriptManagement/TagSearchCascader',
                params: {
                    tag_project: value,
                    tag_type: '脚本',
                    page: 1,
                    page_size: 999
                },
                callback: flag => {
                    if (flag == 'success') {
                        let selectTagList = currentData?.case_tags ? transformTagData(currentData.case_tags) : [];
                        if (type == 'init') {
                            form.setFieldsValue({ 'tags': selectTagList });
                            setTagsValue(selectTagList);
                        } else if (type == 'search' || value == form.getFieldValue('project')) {
                            form.setFieldsValue({ 'tags': tagsValue });
                        } else {
                            form.setFieldsValue({ 'tags': undefined });
                        }
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
        setTagsValue(e);
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

    const batchUpdateInterfaceInfo = (insertList) => {
        const templateInfo = insertList.reduce((acc, item) => ({
            ...acc,
            [item.insertKey]: item.insertValue
        }), { ...caseInfo })

        dispatch({
            type: 'scriptManagement/syncCaseInfo',
            caseInfo: templateInfo
        })
    };

    //. 公共脚本change
    const isPublicScriptChange = (e) => {
        const newValue = e.target.value;
        const oldValue = radioValue;

        if (newValue == oldValue) return;

        if (newValue === "1") {
            Modal.confirm({
                title: '确认操作',
                content: '是否可被其他脚本引用修改为“是”时，当前脚本所引用的其他公共脚本将被删除，是否确认修改？',
                onOk: () => {
                    setRadioValue(newValue);
                    form.setFieldsValue({ isPublicScript: newValue });

                    updateCaseInfo('case_type', e.target.value === "1" ? "公共脚本" : "用户脚本");

                    let treeListCopy = JSON.parse(JSON.stringify(stepTreeList));
                    dispatch({
                        type: 'scriptManagement/syncStepTreeMiddleList',
                        stepTreeMiddleList: treeListCopy
                    });
                    let noPublicScriptTreeList = treeListCopy.filter(item => item.quote_steps.length == 0);
                    dispatch({
                        type: 'scriptManagement/syncStepTreeList',
                        stepTreeList: noPublicScriptTreeList
                    });

                    dispatch({
                        type: 'scriptManagement/syncSelectedNode',
                        selectedNode: {}
                    });
                },
                onCancel: () => {
                    form.setFieldsValue({ isPublicScript: oldValue });
                }
            });
        } else {
            // let treeListCopy = JSON.parse(JSON.stringify(stepTreeMiddleList));
            setRadioValue(newValue);
            form.setFieldsValue({ isPublicScript: newValue })

            updateCaseInfo('case_type', e.target.value === "1" ? "公共脚本" : "用户脚本");
        }
    };

    //. 公共脚本提示
    const publicScriptTitleRender = (
        <div>
            <Popover content={<div>
                <div>1、某脚本可被其他脚本引用时，则该脚本为公共脚本； </div>
                <div>2、公共脚本不可再引用其他公共脚本。</div>
                <div>示例：脚本A、脚本B为公共脚本，脚本C非公共脚本，则脚本C可以引用脚本A和脚本B，但脚本A和脚本B无法互相引用。</div>
            </div>}>
                <QuestionCircleOutlined style={{ marginRight: 5, cursor: 'pointer', color: '#1890ff' }} />
            </Popover>
            是否可被其他脚本引用
        </div>
    );

    const handleJump = () => {
        window.open(`${window.location.origin}/#/controller/tagManagement`)
    };

    return (
        <div className={styles['title-content']}>
            <Form form={form}>
                <Row>
                    <Col span={11} className={styles['row-content']}>
                        <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="脚本名称" name="scriptName"
                            rules={[{ required: true, message: "请输入脚本名称" }]}
                        >
                            {/* <Input placeholder="请输入脚本名称" onChange={(e) => { updateCaseInfo('case_name', e.target.value) }} /> */}
                            <TextArea
                                autoSize={{ minRows: 1, maxRows: 4 }}
                                placeholder="请输入脚本名称"
                                onChange={e => {
                                    updateCaseInfo('case_name', e.target.value)
                                }}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={1}></Col>

                    <Col span={11} className={styles['row-content']}>
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

                </Row>

                <Row style={{ marginTop: 15 }}>
                    <Col span={11} >
                        <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 17 }} label="正/反案例" name="caseAttr"
                            rules={[{ required: true, message: "请选择正/反案例" }]}
                        >
                            <Radio.Group onChange={caseAttrChange} >
                                <Radio value='正案例' >正案例</Radio>
                                <Radio value='反案例' >反案例</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>

                    <Col span={1}></Col>

                    <Col span={11} >
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
                                placeholder="请先选择应用"
                                value={tagsValue}
                                onChange={selectedTargetChange}
                                onDropdownVisibleChange={e => {
                                    e && applicationChange(form.getFieldValue('project'), 'search');
                                }}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={1} style={{ display: 'flex', alignItems: 'center', width: '100%' }} >
                        <Popover content="跳转至：标签管理页面" >
                            <TagsOutlined style={{ cursor: 'pointer', color: '#1890ff', position: 'absolute', left: '-80%', fontSize: 18 }} onClick={() => { handleJump() }} />
                        </Popover>
                    </Col>
                </Row>

                <Row style={{ marginTop: 15 }}>
                    <Col span={11} >
                        <Form.Item labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label={publicScriptTitleRender} name="isPublicScript"
                            rules={[{ required: true, message: "请选择是否为公共脚本" }]}
                        >
                            <Radio.Group onChange={isPublicScriptChange} value={radioValue} >
                                <Radio value='1' >是</Radio>
                                <Radio value='2' >否</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>

                    <Col span={1}></Col>

                    <Col span={11} className={styles['row-content']}>
                        <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="脚本描述" name="description"
                        >
                            <TextArea
                                autoSize={{ minRows: 1, maxRows: 6 }}
                                rows={1}
                                placeholder="请输入脚本描述"
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

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(TitleContent);