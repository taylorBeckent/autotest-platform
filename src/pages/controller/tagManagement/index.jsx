import React, { useState, useEffect, } from 'react';
import { Table, Popconfirm, Popover, Input, Button, Form, Card, Row, Col, Select, Cascader, Dropdown, Modal, Menu, Spin, AutoComplete } from 'antd';
import styles from './index.less';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { connect } from 'umi';

const { Option } = Select;

const TagManagement = (props) => {
    const {
        dispatch,
        scriptManagement: { applicationList, cascaderTagsList, },
        tagManagement: { pageInfo, tableData, total },
    } = props;

    const [form] = Form.useForm();
    const [classifyForm] = Form.useForm();
    const [subClassForm] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [classifyModalStatus, setClassifyModalStatus] = useState('closed'); //. 大类
    const [subClassModalStatus, setSubClassModalStatus] = useState('closed'); //. 细类
    const [classifyList, setClassifyList] = useState([]); // 大类下拉
    const [currentRecord, setCurrentRecord] = useState({});

    useEffect(() => {
        searchApplication();
        handleTagSearch();
        handleSearch({ page: 1, size: 10 });
    }, []);

    const columns = [
        {
            title: '序号',
            align: 'center',
            width: 80,
            render: (text, record, index) => {
                return <span>{(pageInfo.current - 1) * pageInfo.pageSize + index + 1}</span>
            }
        },
        {
            title: '一级标签',
            key: 'tag_mode',
            dataIndex: 'tag_mode',
            align: 'center',
            width: 150,
            ellipsis: true
        },
        {
            title: '二级标签',
            key: 'tag_name',
            dataIndex: 'tag_name',
            align: 'center',
            width: 150,
            ellipsis: true
        },
        {
            title: '应用',
            key: 'tag_project_name',
            dataIndex: 'tag_project_name',
            align: 'center',
            width: 150,
            ellipsis: true
        },
        // {
        //     title: '类型',
        //     key: 'tag_type',
        //     dataIndex: 'tag_type',
        //     align: 'center',
        //     width: 150,
        // },
        {
            title: '更新时间',
            key: 'updated_time',
            dataIndex: 'updated_time',
            align: 'center',
            width: 270,
        },
        {
            title: '维护人',
            key: 'created_user',
            dataIndex: 'created_user',
            align: 'center',
            width: 100,
        },
        {
            title: '操作',
            align: 'center',
            width: 100,
            fixed: 'right',
            render: (text, record, index) => (
                <Button.Group className={styles.btchBtn}>
                    <Popover content="编辑">
                        <Button type="link" icon={<EditOutlined />} onClick={() => { editModal(record) }} />
                    </Popover>
                    <Popconfirm title="是否删除该标签？" style={{ marginRight: '15px' }} onConfirm={() => { delItem(record) }}>
                        <Popover content="删除">
                            <Button type="link" icon={<DeleteOutlined />} />
                        </Popover>
                    </Popconfirm>
                </Button.Group >
            )
        },
    ];

    const searchApplication = () => {
        dispatch({
            type: 'scriptManagement/ProjectSearch',
            params: {
                page: 1,
                page_size: 9999
            },
        });
    };

    const handleTagSearch = (appId = null) => {
        dispatch({
            type: 'scriptManagement/TagSearchCascader',
            params: {
                tag_project: appId,
                tag_type: '脚本',
                page: 1,
                page_size: 999,
            },
            callback: _ => { }
        })
    };

    const classifyTagSearch = (appId = null, type = null, searchClassify) => {
        dispatch({
            type: 'tagManagement/ClassifyTagSearch',
            params: {
                tag_project: appId,
                tag_type: '脚本',
                page: 1,
                page_size: 999,
                only_unique_fields: searchClassify
            },
            callback: (flag, resData) => {
                let list = [];
                if (flag == 'success') {
                    resData.forEach(item => {
                        list.push({ value: item.tag_mode });
                    })
                }
                setClassifyList([...new Set(list)]);
            }
        })
    };

    const tagTypeChange = (e) => {
        form.setFieldsValue({ 'tags': undefined });
        handleTagSearch(form.getFieldValue('applicationId'));
    };

    const applicationChange = (e) => {
        form.setFieldsValue({ 'tags': undefined });
        handleTagSearch(e);
    };

    const tagTypeModalChange = (e) => {
        classifyTagSearch(subClassForm.getFieldValue('applicationId'), e, ["tag_mode"]);
    };

    const applicationModalChange = (e) => {
        classifyTagSearch(e, subClassForm.getFieldValue('tagType'), ["tag_mode"]);
    };

    const handleSearch = ({ page, size }, remark = 'none') => {
        dispatch({
            type: 'tagManagement/syncPageInfo',
            pageInfo: {
                current: page,
                pageSize: size
            }
        })
        setLoading(true);
        dispatch({
            type: 'tagManagement/TagTableSearch',
            params: {
                tag_project: form.getFieldValue('applicationId'),
                tag_type: '脚本',
                tag_ids: tagListTransform(form.getFieldValue('tags')),
                page_size: size,
                page,
            },
            callback: _ => {
                setLoading(false);
            }
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

    const DropDownMenu = (record) => {
        return (
            <Menu mode="horizontal" style={{ maxHeight: '300px', maxWidth: '400px', overflow: 'auto' }}>
                <Menu.Item key="classify" onClick={() => { addModal('classify') }} >
                    新增一级标签
                </Menu.Item>
                <Menu.Item key="subClass" onClick={() => { addModal('subClass') }} >
                    新增二级标签
                </Menu.Item>
            </Menu>
        )
    };

    const addModal = (type) => {
        type === 'classify' ? (setClassifyModalStatus('add'), classifyForm.resetFields()) : (setSubClassModalStatus('add'), subClassForm.resetFields());
    };

    const editModal = (record) => {
        setSubClassModalStatus('edit');
        setCurrentRecord(record);
        subClassForm.setFieldsValue({ 'applicationId': record.tag_project, 'classify': record.tag_mode, 'subClass': record.tag_name })
    };

    const handleClassifyOk = () => {
        classifyForm.validateFields().then(() => {
            setLoading(true);
            dispatch({
                type: 'tagManagement/TagCreate',
                params: {
                    tag_type: '脚本',
                    tag_project: classifyForm.getFieldValue('applicationId'),
                    tag_mode: classifyForm.getFieldValue('classify'),
                },
                callback: flag => {
                    if (flag === 'success') {
                        setClassifyModalStatus('closed');
                    }
                    setLoading(false);
                }
            })
        }).catch(error => {
            throw error;
        })
    };

    const handleSubClassOk = () => {
        subClassForm.validateFields().then(() => {
            let url;
            let params = {
                tag_type: '脚本',
                tag_project: subClassForm.getFieldValue('applicationId'),
                tag_mode: subClassForm.getFieldValue('classify'),
                tag_name: subClassForm.getFieldValue('subClass')
            };
            if (subClassModalStatus === 'add') {
                url = 'tagManagement/TagCreate';
            } else {
                url = 'tagManagement/TagUpdate';
                params.tag_id = currentRecord.tag_id;
                params.tag_code = currentRecord.tag_code;
            }

            setLoading(true);
            dispatch({
                type: url,
                params,
                callback: flag => {
                    if (flag === 'success') {
                        setSubClassModalStatus('closed');
                        handleSearch({ page: pageInfo.current, size: pageInfo.pageSize });
                    } else {
                        setLoading(false);
                    }
                }
            })
        }).catch(error => {
            throw error;
        })
    };

    const delItem = (record) => {
        setLoading(true);
        dispatch({
            type: 'tagManagement/TagDelete',
            params: {
                tag_id: record.tag_id,
                tag_code: record.tag_code
            },
            callback: flag => {
                if (flag === 'success') {
                    handleSearch({ page: pageInfo.current, size: pageInfo.pageSize });
                } else {
                    setLoading(false);
                }
            }
        })
    };

    return (
        <>
            <div className={styles.titleWrap} >
                <Card>
                    <div style={{ fontSize: 19, fontWeight: 'bold', margin: '0 0 0 15px' }}> 标签管理 </div>
                </Card>
            </div>

            <Card>
                <Form form={form}>
                    <Row>
                        {/* <Col span={5}>
                        <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 17 }} label="类型" name="tagType">
                            <Select
                                allowClear
                                optionFilterProp='children'
                                placeholder="请选择类型"
                                style={{ width: '100%' }}
                                onChange={tagTypeChange}
                            >
                                <Option key="接口" value="接口">接口</Option>
                                <Option key="脚本" value="脚本">脚本</Option>
                            </Select>
                        </Form.Item>
                    </Col> */}

                        <Col span={5}>
                            <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 17 }} label="应用" name="applicationId" >
                                <Select
                                    allowClear
                                    showSearch
                                    optionFilterProp='children'
                                    placeholder="请选择应用"
                                    style={{ width: '100%' }}
                                    onChange={applicationChange}
                                >
                                    {applicationList.map(item => (
                                        <Option key={item.project_id} value={item.project_id} >{item.project_name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={7}>
                            <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="标签" name="tags" >
                                <Cascader
                                    style={{ width: '100%' }}
                                    options={cascaderTagsList}
                                    multiple
                                    maxTagCount='responsive'
                                    maxTagTextLength={3}
                                    showCheckedStrategy={Cascader.SHOW_CHILD}
                                    placeholder="请选择标签"
                                    showSearch
                                />
                            </Form.Item>
                        </Col>

                        {/* <Col span={6}></Col> */}
                        <Col span={4}>
                            <Button type='primary' style={{ marginLeft: '25px' }} onClick={() => { handleSearch({ page: 1, size: 10 }) }}>查询</Button>
                            {/* <Dropdown overlay={DropDownMenu} trigger={['click']}>
                            <Button type='primary' style={{ marginLeft: '10px' }}> 新增 </Button>
                        </Dropdown> */}

                            <Button type='primary' style={{ marginLeft: '10px' }} onClick={() => { addModal('subClass') }}  > 新增 </Button>
                        </Col>
                    </Row>
                </Form>

                <Table
                    loading={loading}
                    columns={columns}
                    dataSource={tableData}
                    scroll={{ x: '10%' }}
                    pagination={{
                        ...pageInfo,
                        total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['5', '10', '20', '40', '50'],
                        showTotal(total, range) {
                            return `${range[0]}-${range[1]}条，共${total}条`
                        },
                    }}
                    onChange={({ current, pageSize }) => handleSearch({ page: current, size: pageSize })}
                />

                {classifyModalStatus !== 'closed' && (
                    <Modal
                        title={classifyModalStatus === 'add' ? '新增大类' : '编辑大类'}
                        visible={classifyModalStatus !== 'closed'}
                        width="60%"
                        maskClosable={false}
                        onCancel={() => { setClassifyModalStatus('closed') }}
                        onOk={handleClassifyOk}
                    >
                        <Card>
                            <Spin spinning={loading} >
                                <Form form={classifyForm}>
                                    {/* <Row>
                                    <Col span={24}>
                                        <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="类型" name="tagType"
                                            rules={[{ required: true, message: '请选择标签类型' }]}
                                        >
                                            <Select
                                                optionFilterProp='children'
                                                placeholder="请选择标签类型"
                                                style={{ width: '100%' }}
                                            >
                                                <Option key="接口" value="接口">接口</Option>
                                                <Option key="脚本" value="脚本">脚本</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row> */}
                                    <Row>
                                        <Col span={24}>
                                            <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="应用" name="applicationId"
                                                rules={[{ required: true, message: '请选择应用' }]}
                                            >
                                                <Select
                                                    showSearch
                                                    optionFilterProp='children'
                                                    placeholder="请选择应用"
                                                    style={{ width: '100%' }}
                                                >
                                                    {applicationList.map(item => (
                                                        <Option key={item.project_id} value={item.project_id} >{item.project_name}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={24}>
                                            <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="一级标签" name="classify"
                                                rules={[{ required: true, message: '请输入新增的一级标签名称' }]}
                                            >
                                                <Input placeholder='请输入新增的一级标签名称' />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Form>
                            </Spin>
                        </Card>
                    </Modal>
                )}

                {subClassModalStatus !== 'closed' && (
                    <Modal
                        title={subClassModalStatus === 'add' ? '新增大类' : '编辑大类'}
                        visible={subClassModalStatus !== 'closed'}
                        width="60%"
                        maskClosable={false}
                        onCancel={() => { setSubClassModalStatus('closed') }}
                        onOk={handleSubClassOk}
                    >
                        <Card>
                            <Spin spinning={loading} >
                                <Form form={subClassForm}>
                                    {/* <Row>
                                    <Col span={24}>
                                        <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="类型" name="tagType"
                                            rules={[{ required: true, message: '请选择标签类型' }]}
                                        >
                                            <Select
                                                optionFilterProp='children'
                                                placeholder="请选择标签类型"
                                                style={{ width: '100%' }}
                                                onChange={tagTypeModalChange}
                                            >
                                                <Option key="接口" value="接口">接口</Option>
                                                <Option key="脚本" value="脚本">脚本</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row> */}
                                    <Row>
                                        <Col span={24}>
                                            <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="应用" name="applicationId"
                                                rules={[{ required: true, message: '请选择应用' }]}
                                            >
                                                <Select
                                                    showSearch
                                                    optionFilterProp='children'
                                                    placeholder="请选择应用"
                                                    style={{ width: '100%' }}
                                                    onChange={applicationModalChange}
                                                >
                                                    {applicationList.map(item => (
                                                        <Option key={item.project_id} value={item.project_id} >{item.project_name}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={24}>
                                            <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="一级标签" name="classify"
                                                rules={[{ required: true, message: '请选择一级标签' }]}
                                            >
                                                {/* <Select
                                                showSearch
                                                optionFilterProp='children'
                                                placeholder="请选择标签类型"
                                                style={{ width: '100%' }}
                                            >
                                                {classifyList.length > 0 && classifyList.map(item => (
                                                    <Option key={item} value={item}>{item}</Option>
                                                ))}
                                            </Select> */}
                                                <AutoComplete
                                                    options={classifyList}
                                                    placeholder='请输入一级标签'
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={24}>
                                            <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="二级标签" name="subClass"
                                                rules={[{ required: true, message: '请输入要新增的二级标签' }]}
                                            >
                                                <Input placeholder="请输入要新增的二级标签" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Form>
                            </Spin>
                        </Card>
                    </Modal>
                )}
            </Card>
        </>
    )
}

export default connect(({ scriptManagement, tagManagement }) => ({
    scriptManagement,
    tagManagement
}))(TagManagement);