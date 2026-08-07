import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, } from 'react';
import { Table, Popconfirm, Popover, Input, Button, Spin, Form, Card, Row, Col, Select, Checkbox, Cascader, message } from 'antd';
import { DeleteOutlined, CopyOutlined, TagsOutlined } from '@ant-design/icons';
import styles from './index.less';
import { connect, history } from 'umi';
import download from '@/utils/download';
import { NodeTypeReverseMap } from '@/pages/controller/common';

const { Option } = Select;

const InterfaceManagement = (props) => {
    const {
        dispatch,
        dataLoading,
        scriptManagement: { pageInfo, tableData, total, applicationList, tagsList, cascaderTagsList },
    } = props;

    const [form] = Form.useForm();

    const [applicationId, setApplicationId] = useState(); //. 应用值
    const [allCheckValues, setAllCheckValues] = useState({}); //. 标签选中
    const [tagLoading, setTagLoading] = useState(false); //. 标签loading
    const [tableLoading, setTableLoading] = useState(); //. 表格loading;
    const [msgFormat, setMsgFormat] = useState([]); //. 报文格式;
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [sorterInfo, setSorterInfo] = useState({ columnKey: 'updated_time' });
    const sorterInfoRef = useRef();
    const updatedTimeRef = useRef('descend');

    useEffect(() => {
        handleInit();
        handleSearch({ page: 1, size: 10 })
    }, []);

    const handleInit = () => {
        dispatch({
            type: 'scriptManagement/ProjectSearch',
            params: {
                page: 1,
                page_size: 9999
            },
        });

        dispatch({
            type: 'scriptManagement/syncTagsList',
            tagsList: [],
        });

        dispatch({
            type: 'interfaceManagement/syncInterfaceInfo',
            interfaceInfo: [],
        });
    }

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
            title: '接口名称',
            key: 'case_name',
            dataIndex: 'case_name',
            align: 'center',
            width: 230,
            // ellipsis: true,
            render: (text, record) => {
                return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <a
                                onClick={() => {
                                    dispatch({
                                        type: 'scriptManagement/StepInterFacrProtoTypeSearch',
                                        params: {
                                            case_id: record?.case_id,
                                            case_code: record?.case_code
                                        },
                                        callback: (flag, stepTreeList) => {
                                            let protoType = ''
                                            if (stepTreeList[0]?.step_type == 'HTTP请求') {
                                                protoType = 'HTTP'
                                            } else if (stepTreeList[0]?.step_type == 'TCP请求') {
                                                protoType = 'TCP'
                                            } else {
                                                protoType = 'HTTP'
                                            }
                                            dispatch({
                                                type: 'interfaceManagement/syncTitleProtocalType',
                                                titleProtocalType: protoType
                                            })
                                            props.history.push({
                                                pathname: '/controller/interfaceManagement/newInterface',
                                                query: {
                                                    actionMode: 'edit',
                                                    currentData: JSON.stringify(record),
                                                    caseType: '公共接口'
                                                }
                                            })
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
        // {
        //     title: <div>
        //         接口标签
        //         <Popover content="跳转至：标签管理页面">
        //             <TagsOutlined style={{ cursor: 'pointer', color: '#1890ff', marginLeft: 10 }} onClick={() => { handleJump() }} />
        //         </Popover>
        //     </div>,
        //     key: 'case_tags',
        //     dataIndex: 'case_tags',
        //     align: 'center',
        //     width: 200,
        //     ellipsis: true,
        //     render: text => {
        //         if (text && text.length > 0) {
        //             return (
        //                 text.map(item => (
        //                     <span>{item.tag_name}</span>
        //                 ))
        //             )
        //         } else {
        //             return null;
        //         }
        //     }
        // },
        {
            title: '接口描述',
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
            title: '协议类型',
            key: 'step_type',
            dataIndex: 'step_type',
            align: 'center',
            width: 100,
            ellipsis: true,
        },
        {
            title: '更新时间',
            key: 'updated_time',
            dataIndex: 'updated_time',
            align: 'center',
            width: 120,
            // ellipsis: true,
            sorter: true,
            sortOrder: sorterInfo?.columnKey === 'updated_time' && updatedTimeRef.current
        },
        {
            title: '创建时间',
            key: 'created_time',
            dataIndex: 'created_time',
            align: 'center',
            width: 120,
            // ellipsis: true,
        },
        {
            title: '操作',
            align: 'center',
            width: 100,
            fixed: 'right',
            render: (text, record, index) => (
                <Button.Group className={styles.btchBtn}>
                    <Popover content='复制'>
                        <Button
                            type="link"
                            icon={<CopyOutlined />}
                            onClick={() => { handleCopyScript(record) }}
                        />
                    </Popover>

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

    const handleJump = () => {
        props.history.push({
            pathname: '/controller/tagManagement'
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

    //. 应用
    const applicationChange = (value) => {
        setApplicationId(value);
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
        // let selectedTagList = getAllSelectedValues();
        let order = [];
        if (sorterInfoRef.current?.columnKey === 'updated_time') {
            if (updatedTimeRef.current !== 'descend') {
                order.push('updated_time');
            } else {
                order.push('-updated_time');
            }
        }

        dispatch({
            type: 'scriptManagement/CaseSearch',
            params: {
                case_name: form.getFieldValue('scriptName'),
                step_type: form.getFieldValue('step_type'),
                request_args_type: form.getFieldValue('request_args_type'),
                case_project: applicationId || undefined,
                case_tags: (Array.isArray(allCheckValues) && allCheckValues.length > 0) ? tagListTransform(allCheckValues) : [],
                case_types: ['公共接口'],
                page,
                page_size: size,
                order
            }
        })
    };

    //. 删除接口
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
            callback: (flag, resData, stepTreeList) => {
                setTableLoading(false);
                if (flag === 'success') {

                    if (stepTreeList.length > 0) {
                        dispatch({
                            type: 'interfaceManagement/syncInterfaceInfo',
                            interfaceInfo: {
                                ...stepTreeList[1],
                                request_body: (stepTreeList[1]['request_body'] && typeof (stepTreeList[1]['request_body']) == 'object') ? JSON.stringify(stepTreeList[1]['request_body'], null, 2) : stepTreeList[1]['request_body']
                            }
                        })
                    }

                    let { case_id, case_code, ...copyRecord } = record;
                    props.history.push({
                        pathname: '/controller/interfaceManagement/newInterface',
                        query: {
                            actionMode: 'copy',
                            currentData: JSON.stringify(copyRecord)
                        }
                    })
                }
            }
        })
    };

    //. 批量导出
    const handleExport = () => {
        if (!selectedRowKeys || selectedRowKeys.length === 0) {
            message.warn('请先选择要导出的接口');
            return;
        }

        setTableLoading(true);
        let url = selectedRowKeys.length > 10 ? '/database/yk/autotest/case/export_case_datagram_async' : '/database/yk/autotest/case/export_case_datagram_sync';
        download.postGetExcelSync(url, { case_ids: selectedRowKeys }, () => { setTableLoading(false) });
    };

    return (
        <Card>
            <Form form={form}>
                <Row>
                    <Col span={8}>
                        <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="接口名称" name="scriptName">
                            <Input placeholder="请输入接口名称" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="应用" name="applicationId">
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
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="标签" name="tags">
                            <Cascader
                                style={{ width: '100%' }}
                                options={cascaderTagsList}
                                multiple
                                maxTagCount='responsive'
                                maxTagTextLength={3}
                                showCheckedStrategy={Cascader.SHOW_CHILD}
                                placeholder="请先选择应用"
                                onChange={e => setAllCheckValues(e)}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={8}>
                        <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="所属人" name="user" >
                            <Input placeholder="请输入所属人工号" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="协议类型" name="step_type">
                            <Select
                                showSearch
                                optionFilterProp='children'
                                placeholder="请选择协议类型"
                                style={{ width: '100%' }}
                                onChange={(e) => {
                                    if (e == 'HTTP请求') {
                                        // json、xml、raw、form-data、x-www-form-urlencoded、none
                                        let arr = [
                                            {
                                                key: 'json',
                                                value: 'json'
                                            },
                                            {
                                                key: 'xml',
                                                value: 'xml'
                                            },
                                            {
                                                key: 'raw',
                                                value: 'raw'
                                            },
                                            {
                                                key: 'form-data',
                                                value: 'form-data'
                                            },
                                            {
                                                key: 'x-www-form-urlencoded',
                                                value: 'x-www-form-urlencoded'
                                            },
                                            {
                                                key: 'none',
                                                value: 'none'
                                            },
                                        ]
                                        setMsgFormat(arr)
                                    }
                                    if (e == 'TCP请求') {
                                        // json、xml、raw、form-data、x-www-form-urlencoded、none
                                        let arr = [
                                            {
                                                key: 'json',
                                                value: 'json'
                                            },
                                            {
                                                key: 'xml',
                                                value: 'xml'
                                            },
                                            {
                                                key: 'raw',
                                                value: 'raw'
                                            },

                                        ]
                                        setMsgFormat(arr)
                                    }
                                    form.resetFields(['request_args_type'])
                                }}
                            >
                                <Option key='HTTP请求' value='HTTP请求' >HTTP</Option>
                                <Option key='TCP请求' value='TCP请求' >TCP</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="报文格式" name="request_args_type" >
                            <Select
                                showSearch
                                optionFilterProp='children'
                                placeholder="请选择报文格式"
                                style={{ width: '100%' }}
                            >
                                {msgFormat.map(item => {
                                    return <Option key={item.key} value={item.value} >{item.value}</Option>
                                })}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                    <Button type='primary' style={{ marginRight: '10px' }} onClick={() => { handleSearch({ page: 1, size: 10 }) }}>查询</Button>

                    <Button type='primary' onClick={() => {
                        dispatch({
                            type: 'interfaceManagement/syncTitleProtocalType',
                            titleProtocalType: 'HTTP',
                        });
                        history.push({
                            pathname: '/controller/interfaceManagement/newInterface',
                            query: {
                                actionMode: 'add',
                                caseType: '公共接口'
                            }
                        })
                    }} >新增</Button>

                    <Popover content="报文批量导出">
                        <Button type='primary' style={{ marginLeft: '10px' }} onClick={() => { handleExport() }}>报文导出</Button>
                    </Popover>
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
                        onChange={({ current, pageSize }, filter, sorter) => {
                            setSorterInfo(sorter);
                            sorterInfoRef.current = sorter;
                            sorter.columnKey === 'updated_time' && (updatedTimeRef.current = sorter.order);
                            handleSearch({ page: current, size: pageSize });
                        }}
                    />
                </div>
            </div>

        </Card >
    )
};

//. 节点类型 - 反向映射
const nodeTypeReverseMap = { ...NodeTypeReverseMap };

export default connect(({ scriptManagement, interfaceInfo, loading }) => ({
    scriptManagement,
    interfaceInfo,
    dataLoading: loading.effects['scriptManagement/CaseSearch'],
}))(InterfaceManagement);