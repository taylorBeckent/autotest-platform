import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, } from 'react';
import { Modal, Tag, Table, Popconfirm, Popover, Input, Button, Spin, Form, Card, Row, Col, Select, Cascader, message, Badge, Drawer, Space } from 'antd';
import { PlayCircleOutlined, DeleteOutlined, CopyOutlined, PicRightOutlined, LeftCircleOutlined, TagsOutlined, CloseCircleOutlined } from '@ant-design/icons';
import styles from './index.less';
import HistoryWatch from './historyWatch';
import { connect, history } from 'umi';
import utils from './utils';
import { NodeTypeReverseMap } from '@/pages/controller/common';
import EnvConfigModal from './newScript/headerBar/envConfig';

const { Option } = Select;

const ScriptManagement = (props) => {
    const {
        dispatch,
        dataLoading,
        hisDataLoading,
        scriptManagement: { pageInfo, tableData, total, hisTableData, hisPageInfo, hisTotal, applicationList, tagsList, sceneNameList, cascaderTagsList },
    } = props;
    const [form] = Form.useForm();
    const [exectureForm] = Form.useForm();

    const [drawerVisible, setDrawerVisible] = useState(false); //. 历史抽屉弹窗

    const [applicationId, setApplicationId] = useState(); //. 应用值
    const [allCheckValues, setAllCheckValues] = useState([]); //. 标签选中
    const [tagLoading, setTagLoading] = useState(false); //. 标签loading
    const [envModalShow, setEnvModalShow] = useState(false);
    const [exeDetailModalShow, setExeDetailModalShow] = useState(false);
    const [currentRecord, setCurrentRecord] = useState();
    const [currentExeRecord, setCurrentExeRecord] = useState();
    const [screenName, setScreenName] = useState('');
    const [loading, setLoading] = useState(false); //. 执行记录loading
    const [tableLoading, setTableLoading] = useState(); //. 表格loading;
    const [selectedRowKeys, setSelectedRowKeys] = useState();

    const [sceneStatus, setSceneStatus] = useState(false); //. 数据驱动场景名称弹窗
    const [sceneSelectedRowKeys, setSceneSelectedRowKeys] = useState([]);
    const [sceneLoading, setSceneLoading] = useState(false); //. 数据驱动场景弹窗loading;

    const [screenData, setScreenData] = useState([]); // 场景数据 使用数据源的
    const [dataSourceHis, setDataSourceHis] = useState([]);
    const [subDrawerVisible, setSubDrawerVisible] = useState(false); // 数据源

    const [executeLoading, setExecuteLoading] = useState(false); //.执行loading
    const [envConfigStatus, setEnvConfigStatus] = useState('closed'); //. 环境改造弹窗
    const [finalList, setFinalList] = useState([]); //. 校验处理完成后的数据
    const [debugParams, setDebugParams] = useState({}); //. 校验完成处理

    useEffect(() => {

        dispatch({
            type: 'scriptManagement/syncTagsList',
            tagsList: [],
        });

        dispatch({
            type: 'scriptManagement/ProjectSearch',
            params: {
                page: 1,
                page_size: 9999
            },
        });

        handleSearch({ page: 1, size: 10 })
    }, []);

    useEffect(() => {
        const hisData = utils.parseSearchHisTableData(hisTableData);
        setScreenData(utils.sortByTimeAsc(hisData, 'desc'));
    }, [hisTableData]);

    const execClick = (record) => {
        setCurrentExeRecord(record);
        setExeDetailModalShow(true);
    };

    const dataSourceExecClick = (screen, record) => {
        if (record.data.length > 1) {
            setDataSourceHis(record.data);
            setSubDrawerVisible(true);
        } else {
            setSubDrawerVisible(false);
            setScreenName(screen);
            execClick(record.data[0]);
        }
    };

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
                    <div >
                        {record['case_type'] == '公共脚本' && <Popover content="公共脚本"> <Badge style={{ marginRight: 5, cursor: 'pointer' }} color="red" /> </Popover>}
                        <a
                            onClick={() => {
                                props.history.push({
                                    pathname: '/controller/scriptManagement/newScript',
                                    query: {
                                        actionMode: 'edit',
                                        currentData: JSON.stringify(record)
                                    }
                                })
                            }}
                        >{text}</a>
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
            title: <div>
                脚本标签
                <Popover content="跳转至：标签管理页面">
                    <TagsOutlined style={{ cursor: 'pointer', color: '#1890ff', marginLeft: 10, fontSize: 18 }} onClick={() => { handleJump() }} />
                </Popover>
            </div>,
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
            title: '所属人',
            key: 'user',
            dataIndex: 'user',
            align: 'center',
            width: 100,
            ellipsis: true,
        },
        {
            title: '更新时间',
            key: 'updated_time',
            dataIndex: 'updated_time',
            align: 'center',
            width: 120
        },
        {
            title: '执行结果',
            key: 'case_state',
            dataIndex: 'case_state',
            align: 'center',
            width: 200,
            ellipsis: true,
            render: text => {
                return text ? '成功' : '失败'
            }
        },
        {
            title: '执行时间',
            key: 'case_last_time',
            dataIndex: 'case_last_time',
            align: 'center',
            width: 120
        },
        {
            title: '创建人',
            key: 'created_user',
            dataIndex: 'created_user',
            align: 'center',
            width: 100,
            ellipsis: true,
        },
        {
            title: '创建时间',
            key: 'created_time',
            dataIndex: 'created_time',
            align: 'center',
            width: 120
        },
        {
            title: '操作',
            align: 'center',
            width: 160,
            fixed: 'right',
            render: (text, record, index) => (
                <Button.Group className={styles.btchBtn}>
                    <Popover content="执行" >
                        <Button type="link" icon={<PlayCircleOutlined />} onClick={() => { handleExecute(record) }} />
                    </Popover>

                    <Popover content='复制'>
                        <Button type="link" icon={<CopyOutlined />} onClick={() => { handleCopyScript(record) }} />
                    </Popover>

                    <Popconfirm title="是否删除该文件？" style={{ marginRight: '15px' }} onConfirm={() => { handleDelete(record) }}>
                        <Button type="link" icon={<DeleteOutlined />} />
                    </Popconfirm>

                    <Popover content="执行历史">
                        <Button
                            type="link"
                            icon={<PicRightOutlined />}
                            onClick={() => {
                                setCurrentRecord(record)
                                setDrawerVisible(true);
                                handleHistorySearch({ page: 1, size: 10 }, record)
                            }}
                        />
                    </Popover>

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
            title: '场景名称',
            key: 'dataset_name',
            dataIndex: 'dataset_name',
            align: 'center'
        },

        {
            title: '执行结果',
            key: 'case_state',
            dataIndex: 'case_state',
            align: 'center',
            render: (text, record, index) => {
                let color, content;
                switch (text) {
                    case false:
                        color = 'volcano';
                        content = '失败'
                        break;
                    case true:
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
            // width: 550,
        },
        {
            title: '步骤数',
            key: 'step_total',
            dataIndex: 'step_total',
            align: 'center',
            // width: 550,
        },
        {
            title: '成功数',
            key: 'step_pass_count',
            dataIndex: 'step_pass_count',
            align: 'center',
            // width: 550,
        },
        {
            title: '通过率',
            key: 'step_pass_ratio',
            dataIndex: 'step_pass_ratio',
            align: 'center',
            // width: 550,
            // render: (text, record, index) => {
            //     return (
            //         <Popover content={`${record.tip}`}>
            //             <span>{text}</span>
            //         </Popover>
            //     )
            // }
        },
        {
            title: '环境',
            align: 'center',
            key: 'involve_envs',
            dataIndex: 'involve_envs',
            width: 160,
            render: (text, record, index) => {
                return <Space wrap size={[4, 8]}>{text?.join(' , ')}</Space>
            },

        },
        {
            title: '执行时间',
            key: 'case_st_time',
            dataIndex: 'case_st_time',
            align: 'center',
            width: 200,
            render: (text, record, index) => {
                return <span>{text.split('.')[0]}</span>
            }
        },
        {
            title: '执行耗时',
            key: 'case_elapsed',
            dataIndex: 'case_elapsed',
            align: 'center',
            // width: 550,
            render: (text, record, index) => {
                return <span>{text}s</span>
            }
        },
        {
            title: '操作',
            align: 'center',
            dataIndex: 'dataset_name',
            // width: 550,
            render: (text, record, index) => (
                <Button.Group className={styles.btchBtn}>
                    <Button
                        type="primary"
                        onClick={() => { execClick(record); setScreenName(text); }}
                    >
                        查看
                    </Button>
                </Button.Group >
            )
        }
    ];

    const screenColumns = [
        {
            title: '序号',
            align: 'center',
            // width: 80,
            render: (text, record, index) => {
                return <span>{index + 1}</span>
            }
        },
        {
            title: '脚本名称',
            align: 'center',
            key: 'case_name',
            dataIndex: 'case_name',
            // width: 80
        },
        {
            title: '执行结果',
            align: 'center',
            key: 'screen_state',
            dataIndex: 'screen_state',
            // width: 200,
            ellipsis: true,
            render: (text, record, index) => {
                let color, content;
                switch (text) {
                    case false:
                        color = 'volcano';
                        content = '失败'
                        break;
                    case true:
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
            title: '通过率',
            align: 'center',
            key: 'screen_pass_ratio',
            dataIndex: 'screen_pass_ratio',
            // width: 80,
        },
        {
            title: '环境',
            align: 'center',
            key: 'involve_envs',
            dataIndex: 'involve_envs',
            render: (text, record, index) => {
                return <span>{text?.join(' , ')}</span>
            }
            // width: 80,
        },
        {
            title: '执行人',
            align: 'center',
            key: 'exec_name',
            // width: 80,
        },
        {
            title: '执行时间',
            align: 'center',
            key: 'case_st_time',
            dataIndex: 'case_st_time',
            // width: 80,
            render: (text, record, index) => {
                return <span>{text.split('.')[0]}</span>
            }
        },
        {
            title: '执行耗时',
            align: 'center',
            key: 'case_elapsed',
            dataIndex: 'case_elapsed',
            // width: 80,
            render: (text, record, index) => {
                return <span>{text}s</span>
            }
        },
        {
            title: '操作',
            align: 'center',
            dataIndex: 'dataset_name',
            // width: 550,
            render: (text, record, index) => {
                return (<Button.Group className={styles.btchBtn}>
                    <Button
                        type="primary"
                        onClick={() => { dataSourceExecClick(text, record) }}
                    >
                        查看
                    </Button>
                </Button.Group >)
            }
        }
    ];

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

    const handleJump = () => {
        window.open(`${window.location.origin}/#/controller/tagManagement`)
    };

    const applicationChange = (value) => {
        setApplicationId(value);
        if (value) {
            dispatch({
                type: 'scriptManagement/TagSearchCascader',
                params: {
                    tag_project: value,
                    tag_type: '脚本',
                    page: 1,
                    page_size: 999
                },
                callback: _ => { }
            })
        }
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

    //. 查询
    const handleSearch = ({ page, size }) => {
        dispatch({
            type: 'scriptManagement/syncPageInfo',
            pageInfo: {
                current: page,
                pageSize: size
            }
        });

        dispatch({
            type: 'scriptManagement/CaseSearch',
            params: {
                case_name: form.getFieldValue('scriptName'),
                case_project: applicationId || undefined,
                case_tags: (Array.isArray(allCheckValues) && allCheckValues.length > 0) ? tagListTransform(allCheckValues) : [],
                case_types: ['用户脚本', '公共脚本'],
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
    };

    //. 复制脚本
    const handleCopyScript = (record) => {
        setTableLoading(true);
        dispatch({
            type: 'scriptManagement/ScriptCopyTreeSearch',
            params: {
                case_id: record?.case_id,
                case_code: record?.case_code
            },
            nodeTypeReverseMap,
            callback: (flag, resData) => {
                setTableLoading(false);
                if (flag === 'success') {
                    let { case_id, case_code, ...copyRecord } = record;
                    props.history.push({
                        pathname: '/controller/scriptManagement/newScript',
                        query: {
                            actionMode: 'copy',
                            currentData: JSON.stringify(copyRecord)
                        }
                    })
                }
            }
        })
    };

    //. 是否使用测试数据Change
    const useDataDrivenChange = (e) => {
        if (e == "是") {
            setSceneSelectedRowKeys([]);
            setEnvModalShow(false);
            setSceneStatus(true);

            setSceneLoading(true);
            dispatch({
                type: 'scriptManagement/QueryNames',
                params: {
                    case_id: currentRecord?.case_id
                },
                callback: _ => {
                    setSceneLoading(false);
                }
            })
        }
    };

    //. 执行弹窗
    const handleExecute = (record) => {
        exectureForm.resetFields('');

        setExecuteLoading(true);
        dispatch({
            type: 'scriptManagement/StepTreeExecuteSearch',
            params: {
                case_id: record?.case_id,
                case_code: record?.case_code
            },
            callback: (flag, data) => {
                setFinalList(data);
                setExecuteLoading(false);
            }
        })
        setCurrentRecord(record);
        setEnvModalShow(true);
    };

    //. 执行
    const handleSave = () => {
        let params = {
            case_id: currentRecord?.case_id,
            initial_variables: [],
        };
        if (exectureForm.getFieldValue('useDataDriven') === '是') { params.selected_dataset_names = sceneSelectedRowKeys }
        setDebugParams(params);
        setEnvModalShow(false);
        setSceneStatus(false);
        setEnvConfigStatus('open'); //. 环境配置弹窗打开
    };

    //. 查询历史执行记录
    const handleHistorySearch = ({ page, size }, recordItem) => {
        dispatch({
            type: 'scriptManagement/syncHistoryPageInfo',
            pageInfo: {
                current: page,
                pageSize: size
            }
        })
        let payload = {
            page,
            page_size: size,
            case_id: recordItem.case_id,
            case_code: recordItem.case_code,
            report_type: '异步执行',
            case_id: recordItem.case_id,
            order: [
                "-updated_time"
            ]
        };

        setLoading(true);
        dispatch({
            type: 'scriptManagement/QueryHistoryTableData',
            payload,
            callback: _ => {
                setLoading(false);
            }
        })
    };

    return (
        <Card>
            <Form form={form}>
                <Row>
                    <Col span={6}>
                        <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="脚本名称" name="scriptName" >
                            <Input placeholder="请输入脚本名称" />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="应用" name="applicationId" >
                            <Select
                                showSearch
                                allowClear
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
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="标签" name="tags" >
                            <Cascader
                                style={{ width: '100%' }}
                                options={cascaderTagsList}
                                multiple
                                maxTagCount='responsive'
                                maxTagTextLength={3}
                                showCheckedStrategy={Cascader.SHOW_CHILD}
                                placeholder="请先选择应用"
                                onChange={e => { setAllCheckValues(e) }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="所属人" name="user" >
                            <Input placeholder="请输入所属人工号" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 15 }}>
                    <Button type='primary' style={{ marginRight: '10px' }} onClick={() => { handleSearch({ page: 1, size: 10 }) }}>查询</Button>
                    <Button type='primary' style={{ marginRight: '10px' }} onClick={() => { console.log(selectedRowKeys) }} >脚本转让</Button>

                    <Button type='primary' onClick={() => {
                        props.history.push({
                            pathname: '/controller/scriptManagement/newScript',
                            query: {
                                actionMode: 'add'
                            }
                        })
                    }}>新增</Button>

                    <div className={styles['tips']}>
                        <div>tips:</div>
                        <Badge color="red" text="公共脚本" />
                    </div>
                </Row>
            </Form>

            <div className={styles['content']}>
                <div className={styles['right-side']}>
                    <Table
                        loading={dataLoading || tableLoading}
                        columns={columns}
                        dataSource={tableData}
                        scroll={{ x: '10%' }}
                        rowKey="case_id"
                        rowSelection={{
                            selectedRowKeys,
                            onChange: (keys, rows) => setSelectedRowKeys(keys),
                        }}
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

            <Modal
                title='执行'
                visible={envModalShow}
                width='60%'
                maskClosable={false}
                onCancel={() => setEnvModalShow(false)}
                footer={[
                    <>
                        <Button type="primary" onClick={() => handleSave()} >确定</Button>
                        <Button type="primary" onClick={() => setEnvModalShow(false)} >取消</Button>
                    </>
                ]}
            >
                <Form form={exectureForm}>
                    <Card>
                        <Spin spinning={executeLoading}>
                            <Row>
                                <Col span={24}>
                                    <Form.Item
                                        labelCol={{ span: 7 }}
                                        wrapperCol={{ span: 16 }}
                                        label="是否使用测试数据"
                                        name="useDataDriven"
                                        rules={[{ required: true, message: '请选择是否使用测试数据' }]}
                                        initialValue="否"
                                    >
                                        <Select
                                            showSearch
                                            allowClear
                                            optionFilterProp='children'
                                            placeholder="请选择是否使用测试数据"
                                            style={{ width: '100%' }}
                                            onChange={useDataDrivenChange}
                                        >
                                            <Option key="是" value="是" >是</Option>
                                            <Option key="否" value="否" >否</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Spin>
                    </Card>
                </Form>
            </Modal>
            <Modal
                title="选择测试数据"
                visible={sceneStatus}
                width={800}
                maskClosable={false}
                onCancel={() => { setSceneStatus(false) }}
                footer={[
                    <>
                        <Button onClick={() => { setSceneStatus(false) }} >取消</Button>
                        <Button type="primary" onClick={handleSave} >确认</Button>
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
                            selectedRowKeys: sceneSelectedRowKeys,
                            onChange: (keys, rows) => setSceneSelectedRowKeys(keys),
                        }}
                        pagination={false}
                    />

                    <div className={styles['data-scene-select']} >已选 {sceneSelectedRowKeys.length} 项</div>
                </div>
            </Modal>
            <Drawer
                title="执行历史记录"
                placement="left"
                width='80%'
                closable={true}
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
            >
                <Table
                    loading={loading}
                    columns={screenColumns}
                    dataSource={screenData}
                    pagination={{
                        ...hisPageInfo,
                        total: screenData.size ?? 0,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '50', '100', '200', '500', '1000'],
                        showTotal(total, range) {
                            return `${range[0]}-${range[1]}条，共${total}条`
                        },
                    }}
                    onChange={({ current, pageSize }) => handleHistorySearch({ page: current, size: pageSize }, currentRecord)}
                />
                <Drawer
                    title="数据执行历史"
                    placement="left"
                    width='90%'
                    closable={true}
                    closeIcon={<Button type="link" icon={<LeftCircleOutlined />} />}
                    onClose={() => setSubDrawerVisible(false)}
                    open={subDrawerVisible}
                    style={{ marginRight: 0 }}
                >
                    <Table
                        loading={loading}
                        columns={hisColumns}
                        dataSource={dataSourceHis}
                        rowKey={new Date() + "_"}
                        pagination={{
                            ...hisPageInfo,
                            total: dataSourceHis.size ?? 0,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            pageSizeOptions: ['5', '10', '20', '40', '50'],
                            showTotal(total, range) {
                                return `${range[0]}-${range[1]}条，共${total}条`
                            },
                        }}
                        onChange={({ current, pageSize }) => handleHistorySearch({ page: current, size: pageSize }, currentRecord)}
                    />
                </Drawer>
            </Drawer>

            {exeDetailModalShow ? <HistoryWatch
                exeDetailModalShow={exeDetailModalShow}
                screenName={screenName}
                currentExeRecord={currentExeRecord}
                onCancel={() => { setExeDetailModalShow(false) }}
            /> : null}

            {envConfigStatus !== 'closed' && (
                <EnvConfigModal
                    status={envConfigStatus}
                    finalList={finalList}
                    debugParams={debugParams}
                    onCancel={_ => {
                        setEnvConfigStatus('closed');
                        setSceneStatus(false);
                    }}
                />
            )}
        </Card>
    )
};

//. 节点类型 - 反向映射
const nodeTypeReverseMap = { ...NodeTypeReverseMap };

export default connect(({ scriptManagement, loading }) => ({
    scriptManagement,
    // executeLoading: loading.effects['scriptManagement/ExecuteOrDebugging'],
    dataLoading: loading.effects['scriptManagement/CaseSearch'],
    hisDataLoading: loading.effects['scriptManagement/QueryHistoryTableData'],
}))(ScriptManagement);