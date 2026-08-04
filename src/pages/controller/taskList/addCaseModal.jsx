import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, } from 'react';
import { Modal, Tag, Table, Popconfirm, Popover, Input, Button, Spin, Form, Card, Row, Col, Select, Pagination, Upload, message, Checkbox, Drawer } from 'antd';
import styles from './index.less';
import { PlayCircleOutlined, DeleteOutlined, CopyOutlined, PicRightOutlined } from '@ant-design/icons';
import { connect } from 'dva';
import axios from 'axios';
import download from '@/utils/download';
import { cloneDeep, values } from 'lodash';
const { Option } = Select;
const AddCaseModal = (props) => {
    const {
        dispatch,
        dataLoading,
        hisDataLoading,
        addCaseModalShow,
        addCaseClose,
        casetable,
        caseids,
        setcaseIds,
        caseRows,
        keyNum,
        scriptManagement: { pageInfo, tableData, total, hisTableData, hisPageInfo, hisTotal, applicationList, tagsList },
        taskList:{tableTaskData}
    } = props;

    const [form] = Form.useForm();
    const [drawerVisible, setDrawerVisible] = useState(false); //. 历史抽屉弹窗

    const [applicationId, setApplicationId] = useState(); //. 应用值
    const [allCheckValues, setAllCheckValues] = useState({}); //. 标签选中
    const [tagLoading, setTagLoading] = useState(false);
    // const [tcSelectedRowKeys, setTcSelectedRowKeys] = useState([]);
    const [tcSelectedRowKeys, setTcSelectedRowKeys] = useState(setcaseIds || []);
    const [tcSelectedRows, setTcSelectedRows] = useState(tableTaskData || []);

    useEffect(() => {

        dispatch({
            type: 'scriptManagement/ProjectSearch',
            params: {
                page: 1,
                page_size: 9999
            },
        })
        handleSearch({ page: 1, size: 10 })
    }, [keyNum]);


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
            title: '脚本名称',
            key: 'case_name',
            dataIndex: 'case_name',
            align: 'center',
            width: 230,
            // ellipsis: true,
            render: (text, record, index) => {
                return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {record['case_type'] == '公共脚本' && <Tag color='orange'>公共脚本</Tag>}

                        <div style={{ flex: 1 }}>
                            <a
                                onClick={() => {
                                    props.history.push({
                                        pathname: '/controller/newScript',
                                        query: {
                                            currentData: JSON.stringify(record)
                                        }
                                    })
                                }}
                            >{text}</a>
                        </div>
                    </div>
                )
            }
        },

        {
            title: '所属应用',
            key: 'case_project',
            dataIndex: 'case_project',
            align: 'center',
            width: 200,
            ellipsis: true,
            render: text => {
                return text?.project_name || null
            }
        },
        {
            title: '脚本标签',
            key: 'case_tags',
            dataIndex: 'case_tags',
            align: 'center',
            width: 200,
            ellipsis: true,
            render: text => {
                if (text && text.length > 0) {
                    return (
                        text.map(item => (
                            <span>{item.tag_name}</span>
                        ))
                    )
                } else {
                    return null;
                }
            }
        },
        {
            title: '脚本描述',
            key: 'case_desc',
            dataIndex: 'case_desc',
            align: 'center',
            width: 300,
            ellipsis: true,
        },
        {
            title: '更新时间',
            key: 'updated_time',
            dataIndex: 'updated_time',
            align: 'center',
            width: 200,
            ellipsis: true,
        },
        {
            title: '创建时间',
            key: 'created_time',
            dataIndex: 'created_time',
            align: 'center',
            width: 200,
            ellipsis: true,
        },
        {
            title: '执行结果',
            key: 'case_state',
            dataIndex: 'case_state',
            align: 'center',
            width: 200,
            ellipsis: true,
            render: (text, record, index) => {
                let color, content;
                switch (text) {
                    case '0':
                        color = 'volcano';
                        content = '失败'
                        break;
                    case '1':
                        color = 'green';
                        content = '成功'
                        break;
                    case '2':
                        color = 'blue';
                        content = '进行中'
                        break;
                    case '3':
                        color = 'blue';
                        content = '中止'
                        break;
                }
                return (<Tag color={color} key={text} className={styles.tagSizeTable}> {content} </Tag>)
            }

        },
        {
            title: '执行时间',
            key: 'case_last_time',
            dataIndex: 'case_last_time',
            align: 'center',
            width: 200,
            ellipsis: true,
        },

        {
            title: '操作',
            align: 'center',
            width: 160,
            render: (text, record, index) => (
                <Button.Group className={styles.btchBtn}>
                    <Popover content="执行" >
                        <Button
                            type="link"
                            icon={<PlayCircleOutlined />}
                        // style={{ background: '#7cdb14', color: '#ffffff', marginLeft: 15 }}
                        />
                    </Popover>

                    <Popconfirm title="是否删除该文件？" style={{ marginRight: '15px' }} onConfirm={() => { handleDelete(record) }}>
                        <Button
                            type="link"
                            icon={<DeleteOutlined />}
                        // style={{ background: '#db3914', color: '#ffffff', marginLeft: 15 }}
                        />
                    </Popconfirm>

                    <Popover content='复制'>
                        <Button
                            type="link"
                            icon={<CopyOutlined />}
                        // style={{ background: '#d7b409e0', color: '#ffffff', marginLeft: 15 }}
                        />
                    </Popover>

                    <Popover content="历史">
                        <Button
                            type="link"
                            icon={<PicRightOutlined />}
                            // style={{ background: '#d725098a', color: '#ffffff', marginLeft: 15 }}
                            onClick={() => { setDrawerVisible(true); handleHistorySearch({ page: 1, size: 10 }) }}
                        />
                    </Popover>

                </Button.Group >
            )
        },
    ]


    const handleSave = () => {
        casetable(tcSelectedRows)
        caseids(tcSelectedRowKeys)
        addCaseClose(false)
        // handleSearch({ page: pageInfo.current, size: pageInfo.pageSize })
    }

    const handleHistorySearch = ({ page, size }, remark = 'none') => {
        dispatch({
            type: 'scriptManagement/syncHistoryPageInfo',
            pageInfo: {
                current: page,
                pageSize: size
            }
        })
        let payload = {
            page,
            size,
        };
        dispatch({
            type: 'scriptManagement/QueryHismtoryTableData',
            payload,
            remark
        })
    };

    //. 勾选标签动态变更
    const handleGroupChange = (groupId, checkedValues) => {
        setAllCheckValues(prev => ({
            ...prev,
            [groupId]: checkedValues
        }));
    };

    //. 获取全量标签
    const getAllSelectedValues = () => {
        let arr = [];
        for (let key in allCheckValues) {
            arr = [...arr, ...allCheckValues[key]]
        }
        return arr;
    };

    const applicationChange = (value) => {
        setApplicationId(value);
        if (value) {
            setTagLoading(true);
            dispatch({
                type: 'scriptManagement/TagSearch',
                params: {
                    tag_project: value,
                    page: 1,
                    page_size: 999
                },
                callback: _ => {
                    setTagLoading(false);
                }
            })
        }
    };

    //. 查询
    const handleSearch = ({ page, size }) => {
        dispatch({
            type: 'scriptManagement/syncPageInfo',
            pageInfo: {
                current: page,
                pageSize: size
            }
        });
        let selectedTagList = getAllSelectedValues();

        dispatch({
            type: 'scriptManagement/CaseSearch',
            params: {
                case_name: form.getFieldValue('scriptName'),
                case_project: applicationId || undefined,
                case_tags: selectedTagList || [],
                page,
                page_size: size
            }
        })
    };

    //. 删除脚本
    const handleDelete = (record) => {
        dispatch({
            type: 'scriptManagement/CaseDelete',
            params: {
                case_id: record?.case_id,
                case_code: record?.case_code
            },
            callback: (flag) => {
                flag == 'success' && handleSearch({ page: pageInfo.current, size: pageInfo.pageSize });
            }
        })
    }
    const rowSelection = {
        type: 'checkbox',
        selectedRowKeys: tcSelectedRowKeys,
        onChange: (key, row) => {
            console.log('rows----', row);
            setTcSelectedRowKeys(key);
            setTcSelectedRows(row)
        },
    };
    return (
        <Modal
            title="添加脚本"
            visible={addCaseModalShow}
            width='80%'
            maskClosable={false}
            onCancel={() => addCaseClose(false)}
            footer={[
                <>
                    <Button type="primary" onClick={() => handleSave()} >确定</Button>
                    <Button type="primary" onClick={() => addCaseClose(false)} >取消</Button>
                </>
            ]}
        >
            {/* <Card> */}
            <Form form={form}>
                <Row>
                    <Col span={6}>
                        <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="脚本名称" name="scriptName"
                        // rules={[{ required: true, message: '请输入脚本名称' }]}
                        >
                            <Input placeholder="请输入脚本名称" />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Button type='primary' style={{ marginRight: '10px' }} onClick={() => { handleSearch({ page: 1, size: 10 }) }}>查询</Button>
                    </Col>

                    {/* <Col span={10}> </Col> */}
                    {/* <Col span={1}>
                            <Button type='primary'>新增</Button>
                        </Col> */}
                </Row>
            </Form>

            <div className={styles['content']}>
                <div className={styles['left-side']}>
                    <div>

                        <Select
                            showSearch
                            optionFilterProp='children'
                            placeholder="请选择应用"
                            style={{ width: '100%' }}
                            value={applicationId}
                            onChange={applicationChange}
                        >
                            {applicationList.map(item => (
                                <Option key={item.project_id} value={item.project_id} >{item.project_name}</Option>
                            ))}
                        </Select>

                        <Spin spinning={tagLoading}>
                            {tagsList.length > 0 ? tagsList.map(item => (
                                <div className={styles['tag-category']}>
                                    <div className={styles['category-title']}>{item.name}</div>
                                    <Checkbox.Group
                                        options={item.options}
                                        value={allCheckValues[item.id] || []}
                                        onChange={(checkedValues) => handleGroupChange(item.id, checkedValues)}
                                        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                                    />
                                </div>
                            )) : (<div className={styles['empty-tag']}>
                                {` 暂无标签数据 \n 请先选择应用`}
                            </div>)}
                        </Spin>

                        {/* <Button style={{ width: '100%' }} onClick={getAllSelectedValues}>
                            获取所有选择
                        </Button> */}
                    </div>
                </div>

                <div className={styles['right-side']}>
                    <Table
                        loading={dataLoading}
                        columns={columns}
                        dataSource={tableData}
                        scroll={{ x: '10%' }}
                        // scroll={{ x: 'max-content' }}
                        rowKey="case_id"
                        rowSelection={rowSelection}

                        pagination={{
                            ...pageInfo,
                            total: total,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            pageSizeOptions: ['5', '10', '20', '50'],
                            showTotal(total, range) {
                                return `${range[0]}-${range[1]}条，共${total}条`
                            },
                        }}
                        onChange={({ current, pageSize }) => handleSearch({ page: current, size: pageSize })}
                    />
                </div>
            </div>


            {/* <Drawer
                title="执行历史记录"
                placement="left"
                width='80%'
                closable={true}
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
            >
                <Table
                    // loading={hisDataLoading}
                    columns={hisColumns}
                    dataSource={hisTableData}
                    // scroll={{ x: '1200' }}
                    // scroll={{ x: 'max-content' }}
                    // rowKey="id"
                    pagination={{
                        ...hisPageInfo,
                        total: hisTotal,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['5', '10', '20', '40', '50'],
                        showTotal(total, range) {
                            return `${range[0]}-${range[1]}条，共${total}条`
                        },
                    }}
                    onChange={({ current, pageSize }) => handleHistorySearch({ page: current, size: pageSize })}
                />
            </Drawer> */}
            {/* </Card> */}
        </Modal>
    )

}


export default connect(({ taskList, scriptManagement, loading }) => ({
    taskList,
    scriptManagement,
    dataLoading: loading.effects['taskList/LogsQuery'],
    hisDataLoading: loading.effects['scriptManagement/QueryHistoryTableData'],
}))(AddCaseModal);

