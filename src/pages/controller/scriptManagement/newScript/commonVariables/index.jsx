import React, { useEffect, useState, useRef } from 'react';
import styles from './index.less';
import { Button, Input, List, Table, Tabs, Card, Tooltip, message, Modal } from 'antd';
import { ApiOutlined, DeleteOutlined, CloseCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { connect } from 'umi';
import { generateUUID } from '@/utils/utils';

const { TextArea } = Input;
const { TabPane } = Tabs;

const CommonVariables = (props) => {

    const {
        currentData,
        actionMode,
        dispatch,
        scriptManagement: { commonVariable, selectedNode, variableList }
    } = props;

    const [dataSource, setDataSource] = useState([]);
    const initialized = useRef(false); //. 初始化闸流（仅用于本地开发-严格模式下）

    const [autoCompleteValue, setAutoCompleteValue] = useState('');
    const [commonFun, setCommonFun] = useState([]); //. 公共函数

    const [batchStatus, setBatchStatus] = useState(false); //.批量导入框
    const [batchData, setBatchData] = useState(); //. 批量数据

    const [currentRecord, setCurrentRecord] = useState({});

    useEffect(() => {
        if (selectedNode?.isQuote) {
            setDataSource(selectedNode?.session_variables);
        } else {
            (commonVariable && commonVariable.length > 0) ? setDataSource(commonVariable) : addNewRow();
        }

    }, [selectedNode]);

    const columns = [
        {
            title: '名称',
            dataIndex: 'key',
            width: '25%',
            align: 'center',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={e => updateRow(record.id, 'key', e.target.value)}
                    placeholder="参数名"
                    disabled={selectedNode?.isQuote}
                />
            )
        },
        {
            title: '值',
            dataIndex: 'value',
            width: '25%',
            align: 'center',
            render: (text, record) => (
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
                        onChange={e => updateRow(record.id, 'value', e.target.value)}
                        placeholder="请输入变量值或变量函数"
                        disabled={selectedNode?.isQuote}
                        autoSize={{ minRows: 1, maxRows: 10 }}
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
        },
        {
            title: 'Description',
            dataIndex: 'description',
            width: '20%',
            align: 'center',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={e => updateRow(record.id, 'description', e.target.value)}
                    placeholder="描述"
                    disabled={selectedNode?.isQuote}
                />
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

    //. 后缀相关----------------------------

    const renderVariables = () => {
        let funList = [];

        if (Array.isArray(variableList) && variableList.length > 0) {
            variableList.map(item => {
                if (item.value.indexOf('$') !== 0 && item.value.indexOf('{') !== 1) {
                    funList.push(item);
                }
            });
        }

        setCommonFun(funList);
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
            id: generateUUID(),
            key: '',
            value: '',
            description: ''
        };
        setDataSource(prev => [...prev, newRow]);
    };

    const deleteRow = (id) => {
        setDataSource(prev => {
            let newList = prev.filter(item => item.id !== id);

            dispatch({
                type: 'scriptManagement/syncCommonVariable',
                commonVariable: newList
            })

            return newList;
        });
    };

    const updateRow = (id, field, value) => {
        setDataSource(prev => {
            let newList = prev.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            );

            dispatch({
                type: 'scriptManagement/syncCommonVariable',
                commonVariable: newList
            })

            return newList;
        })
    };

    //. 批量导入内容提示框
    const editContent = (
        <div>
            <Card title="批量导入" size="small" extra={<CloseOutlined style={{ cursor: 'pointer', ontSize: 16, color: "#8b8b8b" }} onClick={() => { setBatchStatus(false) }} />} >
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

            dispatch({
                type: 'scriptManagement/syncCommonVariable',
                commonVariable: newList
            })

            return newList;
        })

        setBatchStatus(false);
    };

    return (
        <div className={styles['wrapper']}>
            <div className={styles['title-row']}>
                用户定义的变量
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
}

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(CommonVariables);
// export default CommonVariables;