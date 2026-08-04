import React, { useState, useEffect } from 'react';
import { Collapse, Form, Input, Select, Button, Tag, Radio } from 'antd';
import styles from './index.less';
import { DeleteOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const { Option } = Select;

const CollapseComponent = (props) => {
    const {
        currentData,
        currentIndex,
        onDelete,
        onUpdateData
    } = props;

    const [form] = Form.useForm();
    const [nameVal, setNameVal] = useState(); //. 变量名称
    const [sourceVal, setSourceVal] = useState('Response Text'); //. 提取来源
    const [scaleVal, setScaleVal] = useState("SOME"); //.提取范围
    const [expressionVal, setExpressionVal] = useState(); //. 表达式
    const [expandKey, setExpandKey] = useState([]);

    const sourceOption = [
        {
            label: 'Request',
            options: [
                {
                    value: 'Request Form-Data',
                    label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Request Form-Data</span>
                            <div>body</div>
                        </div>
                    )
                },
                {
                    value: 'Request Text',
                    label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Request Text</span>
                            <div>body</div>
                        </div>
                    )
                },
                {
                    value: 'Request Json',
                    label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Request Json</span>
                            <div>body</div>
                        </div>
                    )
                },
                {
                    value: 'Request XML',
                    label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Request XML</span>
                            <div>body</div>
                        </div>
                    )
                },
                {
                    value: 'Request Headers',
                    label: 'Request Headers'
                }
            ]
        },
        {
            label: 'Response',
            options: [
                {
                    value: 'Response Text',
                    label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Response Text</span>
                            <div>body</div>
                        </div>
                    )
                },
                {
                    value: 'Response Json',
                    label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Response Json</span>
                            <div>body</div>
                        </div>
                    )
                },
                {
                    value: 'Response XML',
                    label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Response XML</span>
                            <div>body</div>
                        </div>
                    )
                },
                {
                    value: 'Response Headers',
                    label: 'Response Headers'
                },
                {
                    value: 'Response Cookie',
                    label: 'Response Cookie'
                },
            ]
        },
    ];

    useEffect(() => {
        setNameVal(currentData?.name);
        setSourceVal(currentData?.source);
        setScaleVal(currentData?.scope);
        setExpressionVal(currentData?.expr);
        form.setFieldsValue({ 'name': currentData?.name, 'source': currentData?.source, 'scope': currentData?.scope, 'expr': currentData?.expr })
    }, []);

    useEffect(() => {
        (currentData?.name || currentData?.source || currentData?.expr) ? setExpandKey([]) : setExpandKey(['1']);
    }, []);

    const HeaderRender = () => {
        return (
            <div className={styles['header']}>
                <div className={styles['content']}>
                    {nameVal ? <Tag color="processing">{nameVal}</Tag> : <span></span>}
                    <span>{sourceVal}</span>
                    （{expressionVal ? <Tag color="processing" >{expressionVal}</Tag> : <span></span>}）
                </div>
                <div className={styles['button-group']}>
                    <Button type="link" icon={<DeleteOutlined />} onClick={(e) => onDelete(e, currentData)} ></Button>
                </div>
            </div>
        )
    };

    const updateCurrentData = (field, value) => {
        let newData = { ...currentData, [field]: value };
        onUpdateData(newData);
    };

    return (
        <div className={styles['collapse-container']} key={currentData.id}>
            <Collapse activeKey={expandKey} onChange={keys => { setExpandKey(keys) }} >
                <Panel header={HeaderRender()} key="1" >
                    <Form form={form}>
                        <Form.Item labelCol={{ span: 6 }} wrapperCo={{ span: 16 }} label="变量名称" name="name" >
                            <Input value={nameVal} onChange={(e) => setNameVal(e.target.value)}
                                onBlur={() => updateCurrentData('name', nameVal)} placeholder="变量名称"
                            />
                        </Form.Item>

                        <Form.Item labelCol={{ span: 6 }} wrapperCo={{ span: 16 }} label="提取来源" name="source"
                            initialValue="Response Text"
                        >
                            <Select
                                value={sourceVal}
                                onChange={(e) => {
                                    setSourceVal(e);
                                    updateCurrentData('source', e);
                                }}
                                placeholder="请先选择提取来源"
                                options={sourceOption}
                            />
                        </Form.Item>

                        <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 9 }} label="提取范围" name="scope"
                            initialValue={"SOME"}
                        >
                            <Radio.Group
                                onChange={(e) => {
                                    setScaleVal(e.target.value);
                                    updateCurrentData('scope', e.target.value);
                                }}
                                value={scaleVal}
                            >
                                <Radio value="ALL">整个返回数据</Radio>
                                <Radio value="SOME">提取部分</Radio>
                            </Radio.Group>
                        </Form.Item>

                        {scaleVal !== "ALL" && (
                            <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="提取表达式" name="expr" >
                                <Input value={expressionVal} onChange={(e) => setExpressionVal(e.target.value)}
                                    onBlur={() => updateCurrentData('expr', expressionVal)}
                                    placeholder="提取表达式"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        )}
                    </Form>
                </Panel>
            </Collapse>
        </div>
    )
};

export default CollapseComponent;