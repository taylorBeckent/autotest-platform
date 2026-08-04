import React, { useEffect, useState } from 'react';
import { Select, Input, Button, Row, Col, message, Modal, Form, Table, Tag } from 'antd';
import { connect } from 'umi';

const AddScriptModal = (props) => {
    const {
        dispatch,
        dataLoading,
        status,
        onCancel,
        nodeTypeReverseMap,
        scriptManagement: { tableData, pageInfo, total, caseInfo, applicationList },
    } = props;

    const [form] = Form.useForm();

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        handleSearch({ page: 1, size: 10 });

        dispatch({
            type: 'scriptManagement/GetEffectiveApp',
            params: {
                page: 1,
                page_size: 9999
            },
        });
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
                        {record['case_type'] == '公共接口' && <Tag color='green'>公共接口</Tag>}
                        <div style={{ flex: 1 }}>
                            {text}
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
            width: 130,
            ellipsis: true,
            render: text => {
                return text?.project_name || null
            }
        },
        {
            title: '脚本描述',
            key: 'case_desc',
            dataIndex: 'case_desc',
            align: 'center',
            width: 180,
            ellipsis: true,
        }
    ];

    //. 查询脚本
    const handleSearch = ({ page, size }) => {
        dispatch({
            type: 'scriptManagement/syncPageInfo',
            pageInfo: {
                current: page,
                pageSize: size
            }
        });
        // let selectedTagList = getAllSelectedValues();

        dispatch({
            type: 'scriptManagement/CaseSearch',
            params: {
                case_name: form.getFieldValue('scriptName'),
                case_project: form.getFieldValue('application'),
                // case_tags: selectedTagList || [],
                case_type: form.getFieldValue('caseType') ? [form.getFieldValue('caseType')] : ['公共脚本', '公共接口'],
                page,
                page_size: size
            }
        })
    };

    //. 添加公共脚本
    const handleOK = () => {
        if (selectedRows.length > 0) {
            if (caseInfo?.case_id == selectedRowKeys[0]) {
                message.error('公共脚本不能引用自身，请选择其他脚本');
                return;
            }

            setLoading(true);
            dispatch({
                type: 'scriptManagement/CommonStepTreeSearch',
                params: {
                    case_id: selectedRows[0]?.case_id,
                    case_code: selectedRows[0]?.case_code
                },
                nodeTypeReverseMap,
                callback: (flag, resList) => {
                    let nodeInfo = {
                        nodeName: selectedRows[0]?.case_name,
                        quote_case_id: selectedRows[0]?.case_id
                    }
                    onCancel(flag, resList, nodeInfo);
                    setLoading(false);
                }
            })
        } else {
            message.error('请先选择要添加的脚本');
        }
    }

    return (
        <Modal
            title="引用公共接口/脚本"
            visible={status !== 'closed'}
            width={1000}
            maskClosable={false}
            onCancel={onCancel}
            footer={[
                <>
                    <Button type="primary" onClick={handleOK} loading={loading} >确定</Button>
                </>
            ]}
        >
            <Form form={form}>
                <Row>
                    <Col span={1}></Col>
                    <Col span={6}>
                        <Form.Item labelCol={{ span: 8 }} wrapperCol={{ span: 15 }} label="应用" name="application" >
                            <Select
                                allowClear
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="请选择应用"
                                optionFilterProp='children'
                            >
                                {applicationList.length > 0 && applicationList.map(item => (
                                    <Option key={item.project_id} value={item.project_id} >{item.project_name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item labelCol={{ span: 8 }} wrapperCol={{ span: 15 }} label="类型" name="caseType" >
                            <Select
                                allowClear
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="请选择类型"
                                optionFilterProp='children'
                            >
                                <Option key="公共接口" value="公共接口">公共接口</Option>
                                <Option key="公共脚本" value="公共脚本">公共脚本</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item labelCol={{ span: 8 }} wrapperCol={{ span: 15 }} label="接口/脚本名称" name="scriptName">
                            <Input placeholder="请输入脚本名称" />
                        </Form.Item>
                    </Col>
                    <Col span={1}></Col>
                    <Col span={2}>
                        <Button type="primary" onClick={() => { handleSearch({ page: 1, size: 10 }) }}> 查询</Button>
                    </Col>
                </Row>
            </Form>

            <Table
                loading={dataLoading}
                columns={columns}
                dataSource={tableData}
                scroll={{ x: '10%' }}
                // scroll={{ x: 'max-content' }}
                rowKey="case_id"
                rowSelection={{
                    type: "radio",
                    selectedRowKeys,
                    onChange: (keys, rows) => {
                        setSelectedRowKeys(keys);
                        setSelectedRows(rows);
                    }
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
        </Modal>
    )
}

export default connect(({ scriptManagement, loading }) => ({
    scriptManagement,
    dataLoading: loading.effects['scriptManagement/CaseSearch'],
}))(AddScriptModal);