import React, { useState, useEffect, useRef } from 'react';
import { Table, Input, Button, Space, Card, AutoComplete, Tooltip, Tag } from 'antd';
import { ApiOutlined, DeleteOutlined } from '@ant-design/icons';
import { connect } from 'umi';
import { generateUUID } from '@/utils/utils';
// import styles from './index.less';

const RequestFormUrlencoded = (props) => {

    const {
        dispatch,
        // scriptManagement: { stepTreeList },
        interfaceManagement: { interfaceInfo }
    } = props;

    const [dataSource, setDataSource] = useState([]);

    useEffect(() => {
        if (interfaceInfo?.request_form_urlencoded && interfaceInfo?.request_form_urlencoded.length > 0) {
            setDataSource(transformData(interfaceInfo?.request_form_urlencoded));
        } else {
            setDataSource([]);
            addNewRow();
        }
    }, []);

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
                    disabled={dataSource.length === 1}
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

            updateInterfaceInfo('request_form_urlencoded', newList);
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

            updateInterfaceInfo('request_form_urlencoded', newList);
            return newList;
        })
    };

    //. 更新数据
    const updateInterfaceInfo = (field, value) => {
        dispatch({
            type: 'interfaceManagement/syncInterfaceInfo',
            interfaceInfo: {
                ...interfaceInfo,
                [field]: value
            }
        })
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
                    <Button type="dashed" onClick={addNewRow} block >
                        + 添加参数
                    </Button>
                )}
            />
        </div>
    )
};

export default connect(({ scriptManagement, interfaceManagement }) => ({
    scriptManagement,
    interfaceManagement
}))(RequestFormUrlencoded);