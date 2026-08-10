import React, { useState, useRef, useEffect } from 'react';
import { AutoComplete, Input, Modal, Popconfirm, Button, Table, Spin, Form, Card, Row, Col, Select, Radio, message, Icon, Popover } from 'antd';
import styles from './index.less';
import { connect } from 'umi';
import { EditOutlined, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { generateUUID } from '@/utils/utils';
import ChildTable from './ChildTable';
import DBChild from './DBChild';
import ChildEditModal from './ChildEditModal';

const { Option } = Select;
const { TextArea } = Input;

const EnvManagement = (props) => {
    const {
        dispatch,
        dataLoading,
        envManagement: { pageInfo, tableData, total, systemOption },
    } = props;

    const [tableForm] = Form.useForm();
    const [addFirstForm] = Form.useForm();

    const childRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [envOption, setEnvOption] = useState([]);
    const [nodeTypeVal, setNodeTypeVal] = useState(); //. 节点类型
    const [addModalStatus, setAddModalStatus] = useState('closed'); //. 新增一级菜单弹窗

    const [modalShow, setModalShow] = useState('closed'); //. 子节点弹窗
    const [currentRecord, setCurrentRecord] = useState({});

    const [childCtrl, setChildCtrl] = useState({ flag: 'none', id: 0 });

    useEffect(() => {
        envSearch();
        applicationSearch();
        handleSearch({ page: 1, size: 10 });
    }, []);

    const columns = [
        {
            title: '应用',
            key: 'project_name',
            dataIndex: 'project_name',
            align: 'center',
            ellipsis: true,
            width: 300
        },
        {
            title: '环境',
            key: 'env_name',
            dataIndex: 'env_name',
            align: 'center',
            ellipsis: true,
            width: 300
        },
        {
            title: '节点类型',
            key: 'env_type',
            dataIndex: 'DB',
            align: 'center',
            ellipsis: true,
            width: 300,
            // render: text => {
            //     let str;
            //     switch (text) {
            //         case 1:
            //             str = 'APP';
            //             break;
            //         case 2:
            //             str = 'FILE';
            //             break;
            //         case 3:
            //             str = 'DB';
            //             break;
            //     }
            //     return (<div>{str}</div>)
            // }
        },
        {
            title: '操作',
            align: 'center',
            width: 110,
            render: (text, record, index) => (
                <Button.Group className={styles.btchBtn}>
                    <Popover content='新增子节点'>
                        <Button icon={<PlusCircleOutlined />} type="link" onClick={() => { handleAddChild(record) }} />
                    </Popover>

                    <Popover content='编辑'>
                        <Button icon={<EditOutlined />} type="link" onClick={() => { handleEditEnv(record) }} />
                    </Popover>

                    {record?.is_delete ? (
                        <Popconfirm title="是否删除该环境？" style={{ marginRight: '15px' }} onConfirm={() => { handleDelete(record) }}>
                            <Button type="link" icon={<DeleteOutlined />} />
                        </Popconfirm>
                    ) : (
                        <Popover content="该节点下存在子节点数据，不可删除" placement="topRight" >
                            <Button type="link" icon={<DeleteOutlined />} disabled={!record?.is_delete} />
                        </Popover>
                    )}

                </Button.Group >
            )
        },
    ];

    //. 查询应用env_type
    const applicationSearch = () => {
        dispatch({
            type: 'envManagement/GetAllApp',
            payload: { page: 1, page_size: 10000, }
        })
    };

    //. 查询envList
    const envSearch = () => {
        dispatch({
            type: 'envManagement/QueryEnvList',
            params: {
                project_id: []
            },
            callback: (flag, data) => {
                let arr = [];
                let finalArr = [];
                if (flag == 'success') {
                    for (let key in data) {
                        for (let nodeType in data[key]) {
                            arr = [...arr, ...data[key][nodeType]];
                        }
                    }
                    let envArr = [...new Set(arr)];
                    envArr.map(item => {
                        let obj = { value: item };
                        finalArr.push(obj);
                    })
                }
                setEnvOption(finalArr);
            }
        });
    };

    //. 删除
    const handleDelete = (record) => {
        setLoading(true);
        dispatch({
            type: 'envManagement/EnvDelete',
            payload: { id: record.id, env_type: record.env_type },
            callback: flag => {
                if (flag == "success") {
                    handleSearch({ page: pageInfo.current, size: pageInfo.pageSize });
                }
                setLoading(false);
            }
        })
    };

    //. 新增
    const handleNewEnv = () => {
        addFirstForm.resetFields();
        setAddModalStatus('add');
    };

    //. 编辑
    const handleEditEnv = (record) => {
        setCurrentRecord(record);
        addFirstForm.setFieldsValue({ 'project_id': record?.project_id ? parseInt(record?.project_id) : record?.project_id, 'env_name': record?.env_name, 'node_type': record?.env_type });
        setAddModalStatus('edit');
    };

    //. 查询
    const handleSearch = ({ page, size }) => {
        dispatch({
            type: 'envManagement/syncPageInfo',
            pageInfo: {
                current: page,
                pageSize: size,
            }
        })
        let payload = {
            page,
            page_size: size,
            project_id: tableForm.getFieldValue('project_id'),
            env_name: tableForm.getFieldValue('env'),
            env_type: tableForm.getFieldValue('nodeType'),
            ip: tableForm.getFieldValue('IP'),
        };
        setLoading(true);
        dispatch({
            type: 'envManagement/SearchList',
            payload,
            callback: flag => {
                setLoading(false);
            }
        })
    };

    //. 新增母表
    const handleAddParent = () => {
        addFirstForm.validateFields().then(() => {
            let params = {
                project_id: addFirstForm.getFieldValue('project_id'),
                env_name: addFirstForm.getFieldValue('env_name'),
                env_type: addFirstForm.getFieldValue('node_type'),
            };
            addModalStatus == 'edit' && (params.id = currentRecord?.id);

            dispatch({
                type: `envManagement/${addModalStatus == 'add' ? 'EnvAdd' : 'EnvUpdate'}`,
                payload: params,
                callback: flag => {
                    if (flag == 'success') {
                        setAddModalStatus('closed');
                        handleSearch({ page: 1, size: 10 });
                        addModalStatus == 'edit' && setChildCtrl({ flag: 'refresh', id: currentRecord?.id });
                    }
                }
            })
        }).catch(errors => {
            throw errors;
        })
    };

    //. 新增子表
    const handleAddChild = (record) => {
        setModalShow('add');
        setCurrentRecord(record);
    };

    return (
        <Card>
            <Form form={tableForm}>
                <Row style={{ marginBottom: 10 }}>
                    <Col span={5}>
                        <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="所属应用" name="project_id" >
                            <Select
                                showSearch
                                allowClear
                                optionFilterProp='children'
                                placeholder="请选择所属应用"
                            >
                                {systemOption.map((item) => {
                                    return <Option key={item.id} value={item.id} >{item.project_name}</Option>
                                })}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={5}>
                        <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="环境" name="env" >
                            <Input placeholder="请输入查询环境" />
                        </Form.Item>
                    </Col>

                    <Col span={5}>
                        <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="节点类型" name="nodeType" >
                            <Select
                                showSearch
                                allowClear
                                value={nodeTypeVal}
                                optionFilterProp='children'
                                placeholder="请选择节点类型"
                                onChange={e => setNodeTypeVal(e)}
                            >
                                <Option key="APP" value="APP" >APP</Option>
                                <Option key="FILE" value="FILE" >FILE</Option>
                                <Option key="DB" value="DB" >DB</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={5}>
                        <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} label="IP" name="IP" >
                            <Input placeholder="请输入ip" />
                        </Form.Item>
                    </Col>

                    <Col span={4}>
                        <Button type="primary" onClick={() => { handleSearch({ page: pageInfo.current, size: pageInfo.pageSize }) }}>查询</Button>
                        <Button type='primary' style={{ marginLeft: 10 }} onClick={handleNewEnv} >  新增 </Button>
                    </Col>
                </Row>
            </Form>

            <Table
                loading={loading}
                columns={columns}
                dataSource={tableData}
                rowKey={record => { return (record.id + record.uuid) }}
                scroll={{ x: '0%' }}
                expandedRowRender={(record, index, indent, expanded) => {
                    if (record.env_type === "APP" || record.env_type === "FILE") {
                        return (
                            <ChildTable
                                dispatch={dispatch}
                                currentRecord={record}
                                currentData={record.detailVOList?.list}
                                expandedFlag={expanded}
                                childCtrl={childCtrl}
                                callback={flag => {
                                    setChildCtrl({ flag, id: 0 });
                                }}
                            // conditionsBackUp={conditionsBackUp}
                            />
                        )
                    } else if (record.env_type === "DB") {
                        return (
                            <DBChild
                                dispatch={dispatch}
                                currentRecord={record}
                                currentData={record.detailVOList?.list}
                                expandedFlag={expanded}
                                childCtrl={childCtrl}
                                callback={flag => {
                                    setChildCtrl({ flag, id: 0 });
                                }}
                            // conditionsBackUp={conditionsBackUp}
                            />
                        )
                    }
                }}
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
                title={addModalStatus === 'add' ? '新增' : '编辑'}
                visible={addModalStatus !== 'closed'}
                width='60%'
                maskClosable={false}
                onCancel={() => setAddModalStatus('closed')}
                footer={[
                    <>
                        <Button type="primary" onClick={handleAddParent} >确定</Button>
                        <Button type="primary" onClick={() => setAddModalStatus('closed')} >取消</Button>
                    </>
                ]}
            >
                <Form form={addFirstForm}>
                    <Card>
                        <Row>
                            <Col span={24}>
                                <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="所属应用" name="project_id"
                                    rules={[{ required: true, message: '请选择所属应用' }]}
                                >
                                    <Select
                                        showSearch
                                        allowClear
                                        optionFilterProp='children'
                                        placeholder="请选择所属应用"
                                    >
                                        {systemOption.map((item) => {
                                            return <Option key={item.id} value={item.id} >{item.project_name}</Option>
                                        })}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="环境" name="env_name"
                                    rules={[{ required: true, message: '请输入环境' }, { pattern: /^[^\u4e00-\u9fa5]*$/, message: '不能包含中文字符' }]}
                                >
                                    <AutoComplete
                                        options={envOption}
                                        placeholder='请输入环境'
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="节点类型" name="node_type"
                                    rules={[{ required: true, message: '请选择节点类型' }]}
                                >
                                    <Select
                                        showSearch
                                        allowClear
                                        disabled={addModalStatus === 'edit'}
                                        value={nodeTypeVal}
                                        optionFilterProp='children'
                                        placeholder="请选择节点类型"
                                        onChange={e => setNodeTypeVal(e)}
                                    >
                                        <Option key="APP" value="APP" >APP</Option>
                                        <Option key="FILE" value="FILE" >FILE</Option>
                                        <Option key="DB" value="DB" >DB</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                </Form>
            </Modal>

            {modalShow !== 'closed' && (
                <ChildEditModal
                    modalShow={modalShow}
                    nodeType={currentRecord?.env_type}
                    currentRecord={currentRecord}
                    onCancel={flag => {
                        setModalShow('closed');
                        flag === 'success' && setChildCtrl({ flag: 'refresh', id: currentRecord.id });
                    }}
                />
            )}
        </Card>
    )
}

export default connect(({ envManagement, loading }) => ({
    envManagement,
    dataLoading: loading.effects['envManagement/QueryTableData'],
}))(EnvManagement);