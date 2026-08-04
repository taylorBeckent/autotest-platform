import React, { useState, useEffect, } from 'react';
import { Drawer, Modal, Table, Popconfirm, Popover, Input, Button, Spin, Form, Card, Row, Col, Select, DatePicker } from 'antd';
import styles from './index.less';
import { PlayCircleOutlined, DeleteOutlined, CopyOutlined, PicRightOutlined } from '@ant-design/icons';
import { connect } from 'dva';
import { cloneDeep } from 'lodash';
import AddCaseModal from './addCaseModal';
import TaskExeHistory from './taskExeHistory';

const { Option } = Select;
const { RangePicker } = DatePicker;

const TaskList = (props) => {
    const {
        dispatch,
        dataLoading,
        hisDataLoading,
        scriptManagement: { applicationList },
        taskList: { envOption, systemOption, pageInfo, tableData, total, tableTaskData, pageTaskInfo, taskTotal, hisTableData, hisPageInfo, hisTotal },
    } = props;

    const [form] = Form.useForm();
    const [addForm] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [taskModalShow, setTaskModalShow] = useState(false);
    const [taskModalType, setTaskModalType] = useState('0');
    const [addCaseModalShow, setAddCaseModalShow] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [caseIds, setCaseIds] = useState([]);
    const [currentRecord, setCurrentRecord] = useState({});
    const [caseRows, setCaseRows] = useState([]);
    const [keyNum, setKeyNum] = useState();
    const [detailsModalShow, setDetailsModalShow] = useState(false);
    const [detailsRecord, setDetailsRecord] = useState();

    useEffect(() => {
        searchApplication();

        dispatch({
            type: 'taskList/QuerySystemList',
            params: {
                page: 1,
                page_size: 10000,
                order: [
                    "-updated_time"
                ],
                state: 0
            }
        });

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
            title: '任务名',
            key: 'task_name',
            dataIndex: 'task_name',
            align: 'center',
            width: 150,
            ellipsis: true,
            render: (text, record) => {
                return (
                    <span
                        style={{ color: '#4895fab3', cursor: 'pointer', fontWeight: '800' }}
                        onClick={() => { editTaskTable(record) }}
                    >{record.task_name}</span>
                )
            }
        },
        {
            title: '所属应用',
            key: 'project_name',
            dataIndex: 'project_name',
            align: 'center',
            width: 150,
            ellipsis: true
        },

        {
            title: '任务描述',
            key: 'task_desc',
            dataIndex: 'task_desc',
            align: 'center',
            width: 200,
            ellipsis: true
        },
        {
            title: '最新执行时间',
            key: 'updated_time',
            dataIndex: 'updated_time',
            align: 'center',
            width: 120,
        },
        {
            title: '执行人',
            key: 'executeUser',
            dataIndex: 'executeUser',
            align: 'center',
            width: 100,
        },
        {
            title: '创建人',
            key: 'createUser',
            dataIndex: 'createUser',
            align: 'center',
            width: 100,
        },
        {
            title: '创建时间',
            key: 'create_time',
            dataIndex: 'create_time',
            align: 'center',
            width: 120,
        },
        {
            title: '操作',
            align: 'center',
            width: 160,
            fixed: 'right',
            render: (text, record, index) => (
                <Button.Group className={styles.btchBtn}>
                    <Popover content="执行" >
                        <Button
                            type="link"
                            icon={<PlayCircleOutlined />}
                            onClick={() => { execClick(record) }}
                        />
                    </Popover>
                    <Popover content="历史">
                        <Button
                            type="link"
                            icon={<PicRightOutlined />}
                            onClick={() => {
                                setCurrentRecord(record)
                                setDrawerVisible(true)
                                dispatch({
                                    type: 'taskList/syncHistoryPageInfo',
                                    pageInfo: {
                                        current: 1,
                                        pageSize: 10
                                    }
                                })
                                let payload = {
                                    task_code: record?.task_code,
                                    report_type: '异步执行',
                                    order: [
                                        "-updated_time"
                                    ],
                                    page: 1,
                                    page_size: 10,
                                };
                                dispatch({
                                    type: 'taskList/QueryHistoryTableData',
                                    payload,
                                })
                            }}
                        />
                    </Popover>
                    <Popconfirm title="是否删除该文件？" style={{ marginRight: '15px' }} onConfirm={() => { delItem(record) }}>
                        <Button
                            type="link"
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Button.Group >
            )
        },
    ];

    const taskColumns = [
        {
            title: '序号',
            align: 'center',
            width: 80,
            render: (text, record, index) => {
                return <span>{(pageTaskInfo.current - 1) * pageTaskInfo.pageSize + index + 1}</span>
            }
        },
        {
            title: '脚本名称',
            key: 'case_name',
            dataIndex: 'case_name',
            align: 'center',
            // width: 550,
        },
        {
            title: '脚本描述',
            key: 'case_desc',
            dataIndex: 'case_desc',
            align: 'center',
            // width: 550,
        },
        {
            title: '创建时间',
            key: 'created_time',
            dataIndex: 'created_time',
            align: 'center',
            // width: 550,
        },

        {
            title: '操作',
            key: 'taskName',
            dataIndex: 'taskName',
            align: 'center',
            width: 100,
            render: (text, record, index) => (
                <Button.Group className={styles.btchBtn}>
                    <Popconfirm title="是否删除该文件？" style={{ marginRight: '15px' }} onConfirm={() => { handleDelete(record) }}>
                        <Button
                            type="link"
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Button.Group >
            )
        },
    ];

    const hisColumns = [
        {
            title: '序号',
            align: 'center',
            // width: 80,
            render: (text, record, index) => {
                return <span>{(hisPageInfo.current - 1) * hisPageInfo.pageSize + index + 1}</span>
            }
        },
        {
            title: '任务名称',
            key: 'task_name',
            dataIndex: 'task_name',
            align: 'center',
            // width: 550

        },
        {
            title: '版本号',
            key: 'batch_code',
            dataIndex: 'batch_code',
            align: 'center',
            // width: 550,
        },
        {
            title: '执行时间',
            key: 'case_st_time',
            dataIndex: 'case_st_time',
            align: 'center',
            // width: 550,
        },
        {
            title: '操作',
            key: 'taskName',
            dataIndex: 'taskName',
            align: 'center',
            // width: 550,
            render: (text, record, index) => (
                <Button.Group className={styles.btchBtn}>
                    <Button type="primary" onClick={() => { watchClick(record) }} > 查看 </Button>
                </Button.Group >
            )
        },
    ];

    //. 应用查询
    const searchApplication = () => {
        dispatch({
            type: 'scriptManagement/ProjectSearch',
            params: {
                page: 1,
                page_size: 9999
            },
        });
    };

    //. 任务查询
    const handleSearch = ({ page, size }, remark = 'none') => {
        dispatch({
            type: 'taskList/syncPageInfo',
            pageInfo: {
                current: page,
                pageSize: size
            }
        })
        let payload = {
            page,
            page_size: size,
            order: [
                "-updated_time"
            ]
        };
        dispatch({
            type: 'taskList/QueryTableData',
            payload,
            // remark
        })
    };

    //. 新增任务
    const addEditModal = () => {
        setTaskModalType('0')
        addForm.resetFields('')
        setCaseIds([])
        dispatch({
            type: 'taskList/syncTableTiskData',
            tableTaskData: []
        })
        dispatch({
            type: 'taskList/syncEnvData',
            envOption: []
        })
        setTaskModalShow(true)
    };

    //. 查看任务详情
    const editTaskTable = (record) => {
        setCurrentRecord(record)
        setTaskModalType('1')
        dispatch({
            type: 'taskList/QueryDetailTaskList',
            payload: {
                task_id: record.task_id
            },
            callback: (data) => {
                // handleSearch({ page: 1, size: 10 });
                setCaseIds(data?.task_kwargs?.case_ids || [])
                addForm.setFieldsValue({
                    task_name: data?.task_name,
                    task_project: data?.task_project,
                    task_desc: data?.task_desc,
                    task_env: data?.task_kwargs?.task_env,
                })
                dispatch({
                    type: 'taskList/QueryEnvList',
                    params: {
                        page: 1,
                        page_size: 10000,
                        project_id: data?.task_project,
                        order: [
                            "-updated_time"
                        ],
                    }
                })
                dispatch({
                    type: 'taskList/syncTableTiskData',
                    tableTaskData: data?.cases
                })
                setTaskModalShow(true)
            }
        })
    };

    //. 删除文件
    const delItem = (record) => {
        dispatch({
            type: 'taskList/DeleteTable',
            payload: {
                task_code: record.task_code
            },
            callback: () => {
                handleSearch({ page: 1, size: 10 });
            }
        })
    };

    //. 执行历史记录查询
    const handleHistorySearch = ({ page, size }) => {
        dispatch({
            type: 'taskList/syncHistoryPageInfo',
            pageInfo: {
                current: page,
                pageSize: size
            }
        })
        let payload = {
            task_code: currentRecord?.task_code,
            report_type: '异步执行',
            order: [
                "-updated_time"
            ],
            page,
            page_size: size,
        };
        dispatch({
            type: 'taskList/QueryHistoryTableData',
            payload,
        })
    };

    //. 执行
    const execClick = (record) => {
        setDetailsRecord(record)
        let payload = {
            task_id: record.task_id,
            task_code: record.task_code,
            initial_variables: {}
        };
        dispatch({
            type: 'taskList/ExecuteTable',
            payload,
            callback: () => {
                handleSearch({ page: pageInfo.current, size: pageInfo.pageSize })
            }
        })
    };

    //. 查看
    const watchClick = (record) => {
        setDetailsRecord(record)
        let payload = {
            batch_code: record.batch_code,
            task_code: record.task_code,
            order: [
                "-updated_time"
            ],
            page: 1,
            page_size: 10,
        };
        dispatch({
            type: 'taskList/QueryExeTaskTableData',
            payload,
        })
        setDetailsModalShow(true);
    }

    //. 添加脚本
    const addCase = () => {
        setKeyNum(Math.random())
        setAddCaseModalShow(true)
    };

    //. 保存/编辑弹窗中的确认操作
    const handleSave = () => {
        if (taskModalType == '0') {
            addForm.validateFields().then((values) => {
                console.log('values', values);
                dispatch({
                    type: 'taskList/Create',
                    params: {
                        ...values,
                        task_kwargs: {
                            task_env: values.task_env,
                            case_ids: caseIds,
                        },

                        created_user: '',
                        task_type: 'devops发版',
                    },
                    callback: (code) => {
                        if (code == '000000') {
                            setTaskModalShow(false)
                            handleSearch({ page: 1, size: 10 });
                        }
                    }
                })
            }).catch(errors => {
                throw errors
            })
        }
        if (taskModalType == '1') {
            addForm.validateFields().then((values) => {
                dispatch({
                    type: 'taskList/SaveEditTable',
                    payload: {
                        ...values,
                        task_kwargs: {
                            task_env: values.task_env,
                            case_ids: caseIds,
                        },
                        // case_ids: caseIds,
                        created_user: '',
                        task_type: 'devops发版',
                        task_id: currentRecord.task_id,
                    },
                    callback: (code) => {
                        if (code == '000000') {
                            setTaskModalShow(false)
                            handleSearch({ page: pageInfo.current, size: pageInfo.pageSize });
                        }
                    }
                })
            }).catch(errors => {
                throw errors
            })
        }
    };

    //. 删除
    const handleDelete = (record) => {
        let newtableData = cloneDeep(tableTaskData)

        newtableData = newtableData.filter((d) => d.case_id != record.case_id)
        let newtableId = caseIds.filter((d) => d != record.case_id)
        setCaseIds(newtableId)
        dispatch({
            type: 'taskList/syncTableTiskData',
            tableTaskData: newtableData
        })
    };

    return (
        <Card>
            <Form form={form}>
                <Row>
                    <Col span={5}>
                        <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="任务名称" name="taskName">
                            <Input placeholder="请输入任务名称" />
                        </Form.Item>
                    </Col>

                    <Col span={5}>
                        <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="应用" name="applicationId" >
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

                    <Col span={5}>
                        <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="执行人" name="user" >
                            <Input placeholder="请输入执行人工号" />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item labelCol={{ span: 9 }} wrapperCol={{ span: 14 }} label="最新执行时间段" name="time" >
                            <RangePicker />
                        </Form.Item>
                    </Col>

                    <Col span={3}>
                        <Button type='primary' style={{ marginRight: '10px' }} onClick={() => { handleSearch({ page: 1, size: 10 }) }}>查询</Button>
                        <Button type='primary' style={{ marginRight: '10px' }} onClick={addEditModal}> 新增 </Button>
                    </Col>
                </Row>
            </Form>

            <Table
                loading={dataLoading}
                columns={columns}
                dataSource={tableData}
                // scroll={{ x: '1200' }}
                scroll={{ x: '10%' }}
                // rowKey="id"
                pagination={{
                    ...pageInfo,
                    total: total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSizeOptions: ['5', '10', '20', '40', '50'],
                    showTotal(total, range) {
                        return `${range[0]}-${range[1]}条，共${total}条`
                    },
                }}
                onChange={({ current, pageSize }) => handleSearch({ page: current, size: pageSize })}
            />

            <Modal
                title={taskModalType == '0' ? "新增" : '编辑'}
                visible={taskModalShow}
                width='80%'
                maskClosable={false}
                onCancel={() => setTaskModalShow(false)}
                footer={[
                    <>
                        <Button type="primary" onClick={() => handleSave()} >确定</Button>
                        <Button type="primary" onClick={() => setTaskModalShow(false)} >取消</Button>
                    </>
                ]}
            >
                <div style={{ display: 'flex', width: '100%' }}>
                    <div style={{ flex: '1' }}>
                        <Form addForm={addForm}>
                            <Card>
                                <Row>
                                    <Col span={24}>
                                        <Form.Item
                                            labelCol={{ span: 7 }}
                                            wrapperCol={{ span: 16 }}
                                            label="任务名称"
                                            name="task_name"
                                            rules={[{ required: true, message: '请输入任务名称' }]}
                                        >
                                            <Input placeholder='请输入任务名称' />
                                        </Form.Item>
                                    </Col>

                                    <Col span={24}>
                                        <Form.Item
                                            labelCol={{ span: 7 }}
                                            wrapperCol={{ span: 16 }}
                                            label="所属应用"
                                            name="task_project"
                                            rules={[{ required: true, message: '请选择所属应用' }]}

                                        >
                                            <Select
                                                showSearch
                                                allowClear
                                                optionFilterProp='children'
                                                placeholder="请选择所属应用"
                                                onChange={(e) => {
                                                    dispatch({
                                                        type: 'taskList/QueryEnvList',
                                                        params: {
                                                            page: 1,
                                                            page_size: 10000,
                                                            project_id: e,
                                                            order: [
                                                                "-updated_time"
                                                            ],
                                                        }
                                                    })
                                                }}
                                            >
                                                {systemOption.map((item) => {
                                                    return <Option key={item.project_id} value={item.project_id} >{item.project_name}</Option>
                                                })}
                                            </Select>
                                        </Form.Item>
                                    </Col>

                                    <Col span={24}>
                                        <Form.Item
                                            labelCol={{ span: 7 }}
                                            wrapperCol={{ span: 16 }}
                                            label="任务描述"
                                            name="task_desc"
                                            rules={[{ required: true, message: '请输入任务描述' }]}
                                        >
                                            <Input style={{ width: '100%' }}
                                                placeholder="请输入任务描述"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item
                                            labelCol={{ span: 7 }}
                                            wrapperCol={{ span: 16 }}
                                            label="运行环境"
                                            name="task_env"
                                            rules={[{ required: true, message: '请选择运行环境' }]}
                                        >
                                            <Select
                                                showSearch
                                                allowClear
                                                optionFilterProp='children'
                                                placeholder="请选择运行环境"
                                                style={{ width: '100%' }}
                                            >
                                                {envOption.map((item) => {
                                                    return <Option key={item.env_name} value={item.env_name} >{item.env_name}</Option>
                                                })}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        </Form>
                    </div>
                    <div style={{ flex: '2', paddingLeft: '10px' }}>
                        <Row>
                            <Col offset={21} span={5}>
                                <Button type='primary' onClick={addCase}>添加脚本</Button>
                                {/* <Button style={{ background: '#1eb036e0', color: '#ffffff', marginLeft: 15 }}>刷新</Button> */}
                            </Col>
                        </Row>
                        <Table
                            // loading={dataTaskLoading}
                            columns={taskColumns}
                            dataSource={tableTaskData}
                            // scroll={{ x: '1200' }}
                            // rowKey="id"
                            pagination={{
                                ...pageTaskInfo,
                                total: taskTotal,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                pageSizeOptions: ['5', '10', '20', '40', '50'],
                                showTotal(total, range) {
                                    return `${range[0]}-${range[1]}条，共${total}条`
                                },
                            }}
                            onChange={({ current, pageSize }) => handleSearch({ page: current, size: pageSize })}
                        />
                    </div>
                </div>
            </Modal>

            {detailsModalShow ? <TaskExeHistory
                detailsModalShow={detailsModalShow}
                onCancel={() => setDetailsModalShow(false)}
                detailsRecord={detailsRecord}
            /> : null}

            {addCaseModalShow ? <AddCaseModal
                addCaseModalShow={addCaseModalShow}
                setcaseIds={caseIds}
                setCaseRows={caseRows}
                casetable={(data) => {
                    setCaseRows(data)
                    dispatch({
                        type: 'taskList/syncTableTiskData',
                        tableTaskData: data
                    })
                }}
                caseids={(ids) => {
                    setCaseIds(ids)
                }}
                addCaseClose={(flag) => setAddCaseModalShow(flag)}
            /> : null}

            <Drawer
                title="执行历史记录"
                placement="left"
                width='80%'
                closable={true}
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
            >
                <Table
                    loading={hisDataLoading}
                    columns={hisColumns}
                    dataSource={hisTableData}
                    // scroll={{ x: '1200' }}
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
            </Drawer>
        </Card>
    )
}

export default connect(({ taskList, scriptManagement, loading }) => ({
    taskList,
    scriptManagement,
    dataLoading: loading.effects['taskList/QueryTableData'],
    hisDataLoading: loading.effects['scriptManagement/QueryHistoryTableData'],
}))(TaskList);