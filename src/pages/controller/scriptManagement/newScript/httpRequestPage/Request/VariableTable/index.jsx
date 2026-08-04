import React, { useState, useEffect, useRef } from 'react';
import { Table, Input, Button, Space, Card, AutoComplete, Tooltip, Tag, Popover, message, List, Tabs, Menu, Modal } from 'antd';
import { ApiOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import { connect } from 'umi';
import { generateUUID } from '@/utils/utils';
import utils from '../../../../utils';
import styles from './index.less';

const { TextArea } = Input;
const { TabPane } = Tabs;

const VariableTable = (props) => {

    const {
        dispatch,
        scriptManagement: { stepTreeList, selectedNode, variableList, commonVariable }
    } = props;

    const [dataSource, setDataSource] = useState([]);
    const [autoCompleteValue, setAutoCompleteValue] = useState('');
    const [commonFun, setCommonFun] = useState([]); //. 公共函数
    const [commonVariables, setCommonVariables] = useState([]); //. 用户变量

    const [batchStatus, setBatchStatus] = useState(false); //.批量导入框
    const [batchData, setBatchData] = useState(); //. 批量数据

    const [currentRecord, setCurrentRecord] = useState({});

    useEffect(() => {
        if (selectedNode.defined_variables && selectedNode.defined_variables.length > 0) { //. 有默认值
            let newData = transformData(selectedNode.defined_variables);
            setDataSource(newData);
        } else {
            const initialRow = {
                id: 'row-0',
                key: '',
                value: '',
                tagList: [],
                inputValue: '',
                editingTag: {
                    index: null,
                    value: ''
                },
                desc: '',
                variableStatus: false
            };
            setDataSource([initialRow]);
        }

    }, [selectedNode]);

    const columns = [
        {
            title: 'key',
            dataIndex: 'key',
            width: '15%',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => updateRow(record.id, 'key', e.target.value)}
                    placeholder="参数名"
                    disabled={selectedNode?.isQuote}
                />
            )
        },
        {
            title: 'value',
            dataIndex: 'value',
            width: '35%',
            render: (text, record) => {
                return (
                    <div
                        style={{
                            border: '1px solid #d9d9d9',
                            borderRadius: 6,
                            padding: '4px 8px',
                            minHeight: 32,
                            display: 'flex',
                            // flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-bewteen'
                        }}
                    >
                        <TextArea
                            key={`${record.id}`}
                            value={text}
                            onChange={(e) => { updateRow(record.id, 'value', e.target.value) }}
                            placeholder="请输入变量值或变量函数"
                            disabled={selectedNode?.isQuote}
                            autoSize={{ minRows: 1, maxRows: 10 }}
                        // suffix={renderValueSuffix(record)}
                        />
                        <div size="small" style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)' }}>
                            <Button
                                type="link"
                                size="small"
                                icon={<ApiOutlined />}
                                onClick={() => { openAndCloseDialog(record) }}
                                title="工具函数"
                                style={{ height: 'auto', minWidth: 'auto' }}
                            />
                        </div>
                    </div>
                )
            }
        },
        {
            title: 'Description',
            dataIndex: 'desc',
            width: '20%',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => updateRow(record.id, 'desc', e.target.value)}
                    placeholder="描述"
                    disabled={selectedNode?.isQuote}
                />
            )
        },
        {
            title: '操作',
            width: '5%',
            render: (_, record) => (
                <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteRow(record.id)}
                    disabled={dataSource.length === 1 || selectedNode?.isQuote}
                />
            )
        }
    ];

    //. 接口数据格式转换
    const transformData = (sourceData) => {
        let newData = []
        sourceData.map(item => {
            let obj = { ...item };
            obj.id = generateUUID();
            // obj.tagList = [item.value];
            // obj.inputValue = '';
            // obj.variableStatus = false;
            // obj.editingTag = { index: null, value: '' };
            newData.push(obj);
        })
        return newData
    };

    //. 后缀相关----------------------------

    const extractAllVariables = () => {
        let stepTreeCopy = JSON.parse(JSON.stringify(stepTreeList));
        let commonVarCopy = JSON.parse(JSON.stringify(commonVariable));
        let tempList = [...commonVarCopy];

        stepTreeCopy.forEach(stepItem => {
            if (stepItem.extract_variables && stepItem.extract_variables.length > 0) {
                stepItem.extract_variables.forEach(item => {
                    if (item.name) {
                        let obj = {};
                        obj.key = item.name;
                        obj.value = item.name;
                        obj.description = item.expr;
                        tempList.push(obj);
                    }
                })
            }
        });

        if (tempList.length > 0) {
            tempList.forEach(item => {
                item.value = '${' + item.key + '}';
            })
        }

        const map = new Map();
        for (const item of tempList) {
            map.set(item.key, item);
        }
        let variableList = Array.from(map.values());
        return variableList;
    };

    const renderVariables = () => {
        let funList = [];
        let varList = [];

        if (Array.isArray(variableList) && variableList.length > 0) {
            variableList.map(item => {
                if (item.value.indexOf('$') !== 0 && item.value.indexOf('{') !== 1) {
                    funList.push(item);
                }
            });
        }

        varList = extractAllVariables();
        setCommonFun(funList);
        setCommonVariables(varList);
    };

    const handleVariableOk = () => {
        if (autoCompleteValue) {
            // const newTags = [...record.tagList, autoCompleteValue];
            // updateRow(record.id, 'tagList', newTags);

            // const newStr = record.value + '${' + autoCompleteValue + '}';
            const newStr = currentRecord.value + autoCompleteValue;
            updateRow(currentRecord.id, 'value', newStr);
            setAutoCompleteValue('');
        }
        openAndCloseDialog(currentRecord);
    };

    //. 渲染变量列表
    const renderVariableList = (type) => {
        return (
            <List
                size="small"
                itemLayout="horizontal"
                dataSource={type == "fun" ? commonFun : commonVariables}
                renderItem={(item) => (
                    <List.Item style={{ padding: 0 }} actions={[<div>{type == "fun" ? 'Public' : 'User'}</div>]} >
                        <div
                            onClick={() => { type === "fun" ? setAutoCompleteValue('${' + item.value + '}') : setAutoCompleteValue(item.value) }}
                            style={{ width: '100%', padding: '5px 10px', cursor: 'pointer', transition: 'background-color 0.3s' }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                            <List.Item.Meta
                                title={item.value}
                                description={type == "fun" ? item.key : item.description}
                            />
                        </div>
                    </List.Item>
                )}
            />
        )
    };

    //. 后缀相关----------------------------

    //. 打开/关闭弹幕
    const openAndCloseDialog = (record) => {
        if (!record.variableStatus) {
            renderVariables();
        }
        setCurrentRecord({ ...record, variableStatus: !record.variableStatus });
        updateRow(record.id, 'variableStatus', !record.variableStatus);
    };

    //. 添加新行
    const addNewRow = () => {
        const newRow = {
            // id: `row-${nextId}`,
            id: generateUUID(),
            key: '',
            value: '',
            desc: ''
        };
        // setNextId(nextId + 1);
        setDataSource(prev => [...prev, newRow]);
    };

    //. 删除行
    const deleteRow = (id) => {
        setDataSource(prev => {
            let newList = prev.filter(item => item.id !== id);

            updateTreeList([{ insertKey: 'defined_variables', insertValue: newList }]);
            return newList;
        });
    };

    //. 更新行数据
    const updateRow = (id, field, value) => {
        setDataSource(prev => {
            let newList = prev.map(item => {
                let newRowData = {};
                item.id === id ? newRowData = { ...item, [field]: value } : newRowData = item;
                return newRowData;
            })

            updateTreeList([{ insertKey: 'defined_variables', insertValue: newList }]);

            return newList;
        })
    };

    //. 更新整个树结构
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
            <Card title="批量导入" size="small" extra={<CloseOutlined style={{ cursor: 'pointer', fontSize: 17 }} onClick={() => { setBatchStatus(false) }} />} >
                <TextArea
                    style={{ width: '100%' }}
                    placeholder={"请检查导入数据为键值对的格式，例如： \r\r key1: value1 \r key2: value2"}
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

            const key = trimmed.substring(0, colonIndex).trim();
            const value = trimmed.substring(colonIndex + 1).trim();

            if (!key) {
                console.warn(`键名为空，跳过：${item}`);
                return;
            }

            newData.push({
                id: generateUUID(),
                key,
                value
            })
        });

        if (newData.length === 0) {
            message.info('没有解析到有效的键值对');
            return;
        }

        //. 合并数据
        setDataSource(prev => {
            let newList = [...prev, ...newData];
            updateTreeList([{ insertKey: 'defined_variables', insertValue: newList }]);
            return newList;
        })

        setBatchStatus(false);
    };

    return (
        <div className={styles['variable-html']}>
            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="id"
                pagination={false}
                size="small"
                footer={() => (
                    <div style={{ display: 'flex' }}>
                        <Button type="dashed" onClick={addNewRow} block disabled={selectedNode?.isQuote} >
                            + 添加参数
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

            <Modal
                title="变量名"
                visible={currentRecord?.variableStatus}
                width={800}
                maskClosable={false}
                onCancel={() => { openAndCloseDialog(currentRecord) }}
                footer={null}
            >
                <div className={styles['variable-wrapper']} >
                    <div className={styles['variable-content']}>
                        <Input style={{ width: '100%' }} value={autoCompleteValue} onChange={(e) => setAutoCompleteValue(e.target.value)} placeholder="请输入表达式" />

                        <div className={styles['variable-List']} >
                            <Tabs defaultActiveKey="commonFun" tabPosition="left" >
                                <TabPane tab="脚本全局变量" key="scriptVariable">
                                    {renderVariableList('variable')}
                                </TabPane>
                                <TabPane tab="工具内置函数" key="commonFun">
                                    {renderVariableList('fun')}
                                </TabPane>
                            </Tabs>
                        </div>

                        <div className={styles['variable-preview']}>
                            {/* <div>表达式：{autoCompleteValue}</div> */}
                            {/* <div>预览：${`{${autoCompleteValue}}`}</div> */}
                            <div>预览：{autoCompleteValue}</div>
                        </div>
                    </div>

                    <Button type="primary" style={{ width: '100%' }}
                        onClick={() => { handleVariableOk() }}
                    >
                        确定
                    </Button>
                </div>
            </Modal>
        </div>
    )
};

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(VariableTable);