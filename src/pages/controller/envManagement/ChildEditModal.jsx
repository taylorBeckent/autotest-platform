import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, } from 'react';
import { Modal, Tag, Radio, Popconfirm, Popover, Input, Button, Spin, Form, Card, Row, Col, Select, Pagination, Upload, message, Checkbox, Drawer } from 'antd';
import styles from './index.less';
import { PlayCircleOutlined, DeleteOutlined, CopyOutlined, PicRightOutlined } from '@ant-design/icons';
import { connect } from 'dva';

const { Option } = Select;
const { TextArea } = Input;

const AddCaseModal = (props) => {
    const {
        dispatch,
        modalShow,
        nodeType,
        onCancel,
        currentRecord,
    } = props;

    const [form] = Form.useForm();

    useEffect(() => {
        if (modalShow == 'edit' || modalShow == 'copy') {
            // let ipHost = currentRecord?.ip ? extractIP(currentRecord?.ip) : undefined;
            form.setFieldsValue({ 'configName': currentRecord?.config_name, 'env_host': currentRecord?.ip, 'env_port': currentRecord?.port, 'remarks': currentRecord?.remark });

            if (currentRecord?.env_type === 2) {
                form.setFieldsValue({ 'account': currentRecord?.server_account, 'password': currentRecord?.server_password, 'passwordByPass': currentRecord?.is_no_password.toString() });
            } else if (currentRecord?.env_type === 3) {
                form.setFieldsValue({ 'databaseType': currentRecord?.db_type, 'databaseName': currentRecord?.db_name, 'account': currentRecord?.db_user, 'password': currentRecord?.db_password });
            }
        }
    }, [modalShow]);

    //. 编辑时提取ip
    const extractIP = (url) => {
        const match = url.match(/^(?:https?|ftp):\/\/([^:/?#]+)/);
        if (match) {
            const host = match[1];
            return host;
        }
        return null;
    };

    //. 新增子表
    const handleAddOrUpdate = () => {
        form.validateFields().then(() => {
            let params = {
                env_info_id: currentRecord?.project_id,
                env: currentRecord?.env_name,
                config_name: form.getFieldValue('configName'),
                remark: form.getFieldValue('remarks') || null,
                maintainer: '',
                operation: '1',
            };

            if (nodeType === 1) { //. APP
                params.env_host = form.getFieldValue('env_host');
                params.env_port = form.getFieldValue('env_port');
            } else if (nodeType === 2) { //. FILE
                params.server_ip = form.getFieldValue('env_host');
                params.server_port = form.getFieldValue('env_port');
                params.server_account = form.getFieldValue('account');
                params.server_password = form.getFieldValue('password');
                modalShow === 'edit' && (params.server_password = form.getFieldValue('password'));
                params.is_no_password = form.getFieldValue('passwordByPass');
            } else { //. DB
                params.db_type = form.getFieldValue('databaseType');
                params.db_name = form.getFieldValue('databaseName');
                params.db_host = form.getFieldValue('env_host');
                params.db_port = form.getFieldValue('env_port');
                params.db_user = form.getFieldValue('account');
                params.db_password = form.getFieldValue('password');
            }
            modalShow === 'edit' && (params.id = currentRecord?.id, params.project_id = currentRecord?.project_id);

            dispatch({
                type: `envManagement/${(modalShow === 'add' || modalShow === 'copy') ? nodeTypeMapAdd[nodeType] : nodeTypeMapUpdate[nodeType]}`,
                payload: params,
                callback: flag => {
                    if (flag == 'success') {
                        onCancel(flag);
                    }
                }
            })
        }).catch(error => {
            throw error;
        })
    };

    return (
        <Modal
            title={modalShow == 'add' ? '新增' : (modalShow == 'edit' ? '编辑' : '复制')}
            visible={modalShow !== 'closed'}
            width='60%'
            maskClosable={false}
            onCancel={() => onCancel('closed')}
            footer={[
                <>
                    <Button type="primary" onClick={() => { handleAddOrUpdate() }} >确定</Button>
                    <Button type="primary" onClick={() => onCancel('closed')} >取消</Button>
                </>
            ]}
        >
            <Form form={form}>
                <Card>

                    <Row>
                        <Col span={24}>
                            <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="配置名称" name="configName"
                                rules={[{ required: true, message: '请输入配置名称' }]}
                            >
                                <Input placeholder='请输入配置名称' />
                            </Form.Item>
                        </Col>
                    </Row>

                    {nodeType == 3 && (
                        <>
                            <Row>
                                <Col span={24}>
                                    <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="数据库类型" name="databaseType"
                                        rules={[{ required: true, message: '请选择数据库类型' }]}
                                    >
                                        <Select
                                            showSearch
                                            allowClear
                                            optionFilterProp='children'
                                            placeholder="请选择数据库类型"
                                        >
                                            <Option key="mysql" value="mysql" >mysql</Option>
                                            <Option key="oracle" value="oracle" >oracle</Option>
                                            <Option key="tdsql" value="tdsql" >tdsql</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row>
                                <Col span={24}>
                                    <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="数据库名称" name="databaseName"
                                        rules={[{ required: true, message: '请输入数据库名称' }]}
                                    >
                                        <Input style={{ width: '100%' }} placeholder="请输入数据库名称" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </>
                    )}

                    <Row>
                        <Col span={24}>
                            <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="IP" name="env_host"
                                rules={[{
                                    required: true,
                                    // pattern: new RegExp(/^{http|https}:\/\/(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/),
                                    pattern: new RegExp(/^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/),
                                    message: '请输入正确的IP'
                                }]}
                            >
                                <Input style={{ width: '100%' }}
                                    placeholder="请输入ip"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={24}>
                            <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="端口" name="env_port"
                                rules={[{ required: true, message: '请输入端口' }]}
                            >
                                <Input style={{ width: '100%' }}
                                    placeholder="请输入端口"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={24}>
                            <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="备注" name="remarks">
                                <TextArea style={{ width: '100%' }} autoSize={{ minRows: 1, maxRows: 3 }} placeholder="请输入备注" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {(nodeType == 2 || nodeType == 3) && (
                        <div>
                            <Row>
                                <Col span={24}>
                                    <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="登陆账户" name="account"
                                        rules={[{ required: true, message: '请输入登陆账户' }]}
                                    >
                                        <Input style={{ width: '100%' }} placeholder="请输入登陆账户" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row>
                                <Col span={24}>
                                    <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="登录密码" name="password"
                                        rules={[{ required: true, message: '请输入登录密码' }]}
                                    >
                                        <Input style={{ width: '100%' }} placeholder="请输入登录密码" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    )}

                    {nodeType == 2 && (
                        <Row>
                            <Col span={24}>
                                <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="是否免密" name="passwordByPass"
                                    rules={[{ required: true, message: '请选择是否免密' }]}
                                >
                                    <Radio.Group>
                                        <Radio value="0">是</Radio>
                                        <Radio value="1">否</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                        </Row>
                    )}
                </Card>
            </Form>
        </Modal>
    )
}

const nodeTypeMapAdd = {
    '1': 'AppAdd',
    '2': 'FileAdd',
    '3': 'DbAdd'
};

const nodeTypeMapUpdate = {
    '1': 'AppUpdate',
    '2': 'FileUpdate',
    '3': 'DbUpdate'
};

export default connect(({ envManagement }) => ({
    envManagement,
}))(AddCaseModal);

