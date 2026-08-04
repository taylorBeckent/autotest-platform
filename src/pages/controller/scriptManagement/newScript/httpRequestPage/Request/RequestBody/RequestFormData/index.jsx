import React, { useState, useEffect, useRef } from 'react';
import { Table, Input, Button, Space, Card, AutoComplete, Tooltip, Tag, message, Popover } from 'antd';
import { ApiOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import { connect } from 'umi';
import { generateUUID } from '@/utils/utils';
import utils from '../../../../../utils';

const { TextArea } = Input;

const RequestFormData = (props) => {

    const {
        dispatch,
        scriptManagement: { stepTreeList, selectedNode }
    } = props;

    const [dataSource, setDataSource] = useState([]);

    const [batchStatus, setBatchStatus] = useState(false); //.批量导入框
    const [batchData, setBatchData] = useState(); //. 批量数据

    useEffect(() => {
        if (selectedNode.request_form_data && selectedNode.request_form_data.length > 0) {
            setDataSource(transformData(selectedNode.request_form_data));
        } else {
            setDataSource([]);
            addNewRow();
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
                    <Input
                        value={text}
                        onChange={(e) => updateRow(record.id, 'value', e.target.value)}
                        placeholder="参数名"
                        disabled={selectedNode?.isQuote}
                    />
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

    //. 数据格式转换
    const transformData = (sourceData) => {
        const newData = [];
        sourceData.map(item => {
            let obj = { ...item };
            obj.id = generateUUID();
            newData.push(obj);
        })
        return newData;
    };

    //. 添加新行
    const addNewRow = () => {
        const newRow = {
            id: generateUUID(),
            key: '',
            value: '',
            desc: '',
        };
        setDataSource(prev => [...prev, newRow]);
    };

    //. 删除行
    const deleteRow = (id) => {
        setDataSource(prev => {
            let newList = prev.filter(item => item.id !== id);

            updateTreeList([{ insertKey: 'request_form_data', insertValue: newList }]);
            // updateSelectNode('request_form_data', newList);

            return newList;
        });
    };

    //. 更新行数据
    const updateRow = (id, field, value) => {
        setDataSource(prev => {
            let newList = prev.map(item => {
                let currentRow = {};
                item.id === id ? currentRow = { ...item, [field]: value } : currentRow = item;
                return currentRow;
            });

            updateTreeList([{ insertKey: 'request_form_data', insertValue: newList }]);
            // updateSelectNode('request_form_data', newList);

            return newList;
        })
    };

    //. 更新树结构
    const updateTreeList = (insertList) => {
        let finalList = utils.recurseTreeList(stepTreeList, insertList, selectedNode);

        dispatch({
            type: 'scriptManagement/syncStepTreeList',
            stepTreeList: finalList
        })
    };

    //. 更新选中数据
    const updateSelectNode = (field, value) => {
        dispatch({
            type: 'scriptManagement/syncSelectedNode',
            selectedNode: {
                ...selectedNode,
                [field]: value
            }
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
            updateTreeList([{ insertKey: 'request_form_data', insertValue: newList }]);
            return newList;
        })

        setBatchStatus(false);
    };

    return (
        <div>
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
        </div>
    )
};

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(RequestFormData);
// export default RequestFormData;