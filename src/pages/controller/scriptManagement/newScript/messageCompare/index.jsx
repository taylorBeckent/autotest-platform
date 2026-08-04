import React, { useState, useEffect } from 'react';
import { connect } from 'umi';
import { Table, Input, Button, Row, Card, Col, Tooltip, Switch, message, Popover } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { generateUUID } from '@/utils/utils';
import utils from '../../utils';
import styles from './index.less';

const { TextArea } = Input;

const MessageCompare = (props) => {
    const {
        dispatch,
        scriptManagement: { selectedNode, caseInfo, stepTreeList }
    } = props;

    const [requestName, setRequestName] = useState();
    const [dataSource, setDataSource] = useState([]);

    const [batchStatus, setBatchStatus] = useState(false); //.批量导入框
    const [batchData, setBatchData] = useState(); //. 批量数据

    useEffect(() => {
        selectedNode?.content ? setRequestName(selectedNode?.content) : setRequestName();
        
        if (selectedNode.message_comparison && selectedNode.message_comparison.length > 0) {
            setDataSource(transformData(selectedNode.message_comparison));
        } else {
            setDataSource([]);
        }
    }, [selectedNode]);

    const columns = [
        {
            title: 'field1',
            dataIndex: 'left_text',
            width: '25%',
            align: 'center',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={e => updateRow(record.id, 'left_text', e.target.value)}
                    placeholder="请输入变量名，示例： ${变量A}"
                    disabled={selectedNode?.isQuote}
                />
            )
        },
        {
            title: 'field2',
            dataIndex: 'right_text',
            width: '25%',
            align: 'center',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={e => updateRow(record.id, 'right_text', e.target.value)}
                    placeholder="请输入变量名，示例： ${变量B}"
                    disabled={selectedNode?.isQuote}
                />
            )
        },
        {
            title: '比对方式',
            dataIndex: 'order_control',
            width: '20%',
            align: 'center',
            render: (text, record) => (
                <>
                    <label style={{ marginRight: 10 }}>忽略字段顺序： </label>
                    <Switch
                        checked={text == 0}
                        onChange={e => updateRow(record.id, 'order_control', e ? 0 : 1)}
                        disabled={selectedNode?.isQuote}
                        checkedChildren="开"
                        unCheckedChildren="关"
                    />
                </>
            )
        },
        {
            title: '操作',
            width: '5%',
            align: 'center',
            render: (_, record) => (
                <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteRow(record.id)}
                    disabled={dataSource.lenth === 1 || selectedNode?.isQuote}
                />
            )
        },
    ];

    const transformData = (sourceData) => {
        const newData = [];
        sourceData.map(item => {
            let obj = { ...item };
            obj.id = generateUUID();
            newData.push(obj);
        })
        return newData;
    };

    const requestNameChange = (e) => {
        setRequestName(e.target.value);

        let insertList = [
            { insertKey: 'content', insertValue: e.target.value },
            { insertKey: 'step_name', insertValue: e.target.value }
        ];
        updateTreeList(insertList);

        selectedNode['content'] = e.target.value;
        selectedNode['step_name'] = e.target.value;
    };

    const addNewRow = () => {
        const newRow = {
            id: generateUUID(),
            left_text: '',
            right_text: '',
            order_control: 1
        };
        setDataSource(prev => [...prev, newRow]);
    };

    const deleteRow = (id) => {
        setDataSource(prev => {
            let newList = prev.filter(item => item.id !== id);
            updateTreeList([{ insertKey: 'message_comparison', insertValue: newList }]);

            return newList;
        });
    };

    const updateRow = (id, field, value) => {
        setDataSource(prev => {
            let newList = prev.map(item => {
                let currentRow = {};
                item.id === id ? currentRow = { ...item, [field]: value } : currentRow = item;
                return currentRow;
            });

            updateTreeList([{ insertKey: 'message_comparison', insertValue: newList }]);

            return newList;
        })
    };

    const updateTreeList = (insertList) => {
        let finalList = utils.recurseTreeList(stepTreeList, insertList, selectedNode);

        dispatch({
            type: 'scriptManagement/syncStepTreeList',
            stepTreeList: finalList
        })
    };

    //. 批量导入内容提示框
    const editContent = (
        <div>
            <Card title="批量导入" size="small" extra={<div style={{ cursor: 'pointer', fontSize: 17 }} onClick={() => { setBatchStatus(false) }} >X</div>}  >
                <TextArea
                    style={{ width: '100%' }}
                    placeholder={"请检查导入数据为键值对的格式，例如： \r\r fieldA: fieldB \r fieldC: fieldD"}
                    autoSize={{ minRows: 6, maxRows: 12 }}
                    value={batchData}
                    onChange={e => setBatchData(e.target.value)}
                />

                <Button type="primary" style={{ width: '100%', marginTop: 15 }} onClick={() => { handlePasteImport() }}>确定</Button>
            </Card>
        </div>
    );

    const openAndCloseBatchModal = () => {
        setBatchStatus(prev => !prev);
    };

    //. 批量导入解析
    const handlePasteImport = () => {
        if (!batchData) {
            setBatchStatus(false);
            return;
        };

        const newData = [];
        const text = JSON.parse(JSON.stringify(batchData));
        const textList = text.split(/\r?\n/);

        textList.forEach((item, index) => {
            const trimmed = item.trim();
            if (!trimmed) return; //. 跳过空行

            const colonIndex = trimmed.indexOf(':');
            if (colonIndex === -1) {
                console.warn(`跳过无效行: ${item}`);
                return;
            }

            const left_text = trimmed.substring(0, colonIndex).trim();
            const right_text = trimmed.substring(colonIndex + 1).trim();

            if (!left_text) {
                console.warn(`键值对左侧为空，跳过：${item}`);
                return;
            }

            if (!right_text) {
                console.warn(`键值对右侧为空，跳过：${item}`);
                return;
            }

            newData.push({
                id: generateUUID(),
                left_text,
                right_text,
                order_control: 1
            })
        });

        if (newData.length === 0) {
            message.info('没有解析到有效的键值对');
            return;
        }

        //. 合并数据
        setDataSource(prev => {
            let newList = [...prev, ...newData];
            updateTreeList([{ insertKey: 'message_comparison', insertValue: newList }]);
            return newList;
        })

        setBatchStatus(false);
    };

    return (
        <div>
            <div style={{ padding: 10, border: '1px solid #e5e7ee', borderLeft: '5px solid #409eff', borderRadius: 15 }}>
                <Row style={{ alignItems: 'center' }} >
                    <Col span={2} style={{ textAlign: 'center' }}>
                        <label>名称：</label>
                    </Col>
                    <Col span={22}>
                        <Input
                            style={{ borderRadius: 6 }}
                            placeholder="请输入名称"
                            value={requestName}
                            onChange={requestNameChange}
                            disabled={selectedNode?.isQuote}
                        />
                    </Col>
                </Row>
            </div>
            <div className={styles['wrapper']}>
                <div className={styles['title-row']}>
                    待比较的报文
                </div>

                <Table
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    footer={() => (
                        <div style={{ display: 'flex' }}>
                            <Button
                                type="dashed"
                                onClick={addNewRow}
                                disabled={selectedNode?.isQuote}
                                block
                            >
                                + 添加比较报文
                            </Button>

                            <Tooltip placement="bottom" arrowPointAtCenter={true} trigger="click" title={editContent}
                                color="#fff" overlayStyle={{ width: 400, maxWidth: 600 }}
                                open={batchStatus}
                            >
                                <Button type="dashed" onClick={openAndCloseBatchModal} block disabled={selectedNode?.isQuote} >
                                    + 从剪切板导入
                                </Button>
                            </Tooltip>
                        </div>
                    )}
                />
            </div>
        </div>
    )
}

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(MessageCompare)