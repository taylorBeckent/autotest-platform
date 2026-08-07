import React, { useState, useEffect } from 'react';
import { Collapse, Form, Input, Select, Button, Tag, Radio } from 'antd';
import styles from './index.less';
import { DeleteOutlined } from '@ant-design/icons';
import { AssertType, SourceOption } from '@/pages/controller/common';

const { Panel } = Collapse;
const { Option } = Select;

const AssertCollapse = (props) => {
    const {
        currentData,
        currentIndex,
        onDelete,
        onUpdateData
    } = props;

    const [form] = Form.useForm();
    const [nameVal, setNameVal] = useState(); //. 断言名称
    const [sourceVal, setSourceVal] = useState(); //. 断言对象
    const [expressionVal, setExpressionVal] = useState(); //. 表达式
    const [assertSelect, setAssertSelect] = useState(); //. 断言选中
    const [assertVal, setAssertVal] = useState(); //. 断言内容

    const sourceOption = [...SourceOption];

    const assertType = [...AssertType];

    useEffect(() => {
        console.log(currentData);
        setNameVal(currentData?.name || undefined);
        setSourceVal(currentData?.source || undefined);
        setExpressionVal(currentData?.expr || undefined);
        setAssertSelect(currentData?.operation || undefined);
        setAssertVal(currentData?.except_value || undefined);
        form.setFieldsValue({ 'name': currentData?.name || undefined, 'source': currentData?.source || undefined, 'expr': currentData?.expr || undefined, })
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
            <Collapse>
                <Panel header={HeaderRender()} key="1" >
                    <Form form={form}>
                        <Form.Item labelCol={{ span: 6 }} wrapperCo={{ span: 16 }} label="断言名称" name="name" >
                            <Input value={nameVal} onChange={(e) => setNameVal(e.target.value)}
                                onBlur={() => updateCurrentData('name', nameVal)} placeholder="断言名称"
                            />
                        </Form.Item>

                        <Form.Item labelCol={{ span: 6 }} wrapperCo={{ span: 16 }} label="断言对象" name="source"
                        // initialValue="Response Text"
                        >
                            <Select
                                value={sourceVal}
                                onChange={(e) => {
                                    setSourceVal(e);
                                    updateCurrentData('source', e);
                                }}
                                placeholder="断言对象"
                            >
                                {sourceOption.map(item => (
                                    <Option key={item} value={item}>{item}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="断言表达式" name="expr" >
                            <Input value={expressionVal} onChange={(e) => setExpressionVal(e.target.value)}
                                onBlur={() => updateCurrentData('expr', expressionVal)}
                                placeholder="断言表达式"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>

                        <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="断言" name="assert" >
                            <div>
                                <Select
                                    value={assertSelect}
                                    onChange={e => {
                                        setAssertSelect(e);
                                        updateCurrentData('operation', e);
                                        if (e === '为空' || e === '不为空') {
                                            setAssertVal(undefined);
                                            updateCurrentData('except_value', undefined)
                                        }
                                    }}
                                    placeholder="匹配规则"
                                    style={{ width: '50%' }}
                                >
                                    {assertType.map(item => (
                                        <Option key={item} value={item}>{item}</Option>
                                    ))}
                                </Select>
                                {(assertSelect === '为空' || assertSelect === '不为空') ? null : (
                                    <Input value={assertVal} onChange={e => { setAssertVal(e.target.value); updateCurrentData('except_value', e.target.value) }} placeholder="预期值" style={{ width: '50%' }} />
                                )}
                            </div>
                        </Form.Item>
                    </Form>
                </Panel>
            </Collapse>
        </div>
    )
};

export default AssertCollapse;