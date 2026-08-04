import React, { useEffect, useState } from 'react';
import { Select, Button, Input, Table } from 'antd';
import { connect } from 'umi';
import styles from './index.less';

const TableComponent = (props) => {
    const {
        dispatch,
        dataList,
        selectdInfo,
        type,
        updateRow,
        batchUpdateRow,
        envMode,
        ipPortInfo,
        subEnvList,
    } = props;

    const AppOrFileColumns = [
        {
            title: '#',
            dataIndex: '#',
            width: 40,
            render: (text, record, index) => (
                <span>{index + 1}</span>
            )
        },
        {
            title: '环境',
            dataIndex: 'env',
            width: 120,
            align: 'center',
            render: (text, record) => (
                <Select
                    value={text}
                    onChange={(e) => envChange(e, record)}
                    placeholder="请选择全局环境"
                    disabled={envMode == 'single'}
                    style={{ width: '100%' }}
                >
                    {/* {subEnvList.length > 0 && subEnvList.map(item => (
                        <Option key={item} value={item}>{item}</Option>
                    ))} */}
                    {type === 'APP' && Array.isArray(subEnvList['APP']) && subEnvList['APP'].length > 0 && subEnvList['APP'].map(item => (
                        <Option key={item} value={item}>{item}</Option>
                    ))}

                    {type === 'FILE' && Array.isArray(subEnvList['FILE']) && subEnvList['FILE'].length > 0 && subEnvList['FILE'].map(item => (
                        <Option key={item} value={item}>{item}</Option>
                    ))}
                </Select>
            )
        },
        {
            title: '配置名',
            dataIndex: 'configName',
            width: 250,
            align: 'center',
            render: (text, record) => (
                <Select
                    disabled
                    value={text}
                    onChange={(e) => updateRow(selectdInfo.applicationId, record.id, 'configName', e)}
                    placeholder="请选择全局环境"
                    style={{ width: '100%' }}
                >
                    {subEnvList.length > 0 && subEnvList.map(item => (
                        <Option key={item} value={item}>{item}</Option>
                    ))}
                </Select>
            )
        },
        {
            title: 'IP/端口',
            dataIndex: 'ip',
            width: 300,
            align: 'center',
            render: (text, record) => (
                <Input
                    disabled
                    value={(record.ip && record.port) ? record.ip + ':' + record.port : undefined}
                    placeholder="请先选择全局环境和配置"
                />
            )
        },
    ];

    const DBColumns = [
        {
            title: '#',
            dataIndex: '#',
            width: 40,
            render: (text, record, index) => (
                <span>{index + 1}</span>
            )
        },
        {
            title: '环境',
            dataIndex: 'env',
            width: 100,
            align: 'center',
            render: (text, record) => (
                <Select
                    value={text}
                    onChange={(e) => envChange(e, record)}
                    placeholder="请选择全局环境"
                    disabled={envMode == 'single'}
                    style={{ width: '100%' }}
                >
                    {/* <Option key="UAT" value="UAT">UAT</Option>
                    <Option key="PP" value="PP">PP</Option> */}
                    {Array.isArray(subEnvList['DB']) && subEnvList['DB'].length > 0 && subEnvList['DB'].map(item => (
                        <Option key={item} value={item}>{item}</Option>
                    ))}
                </Select>
            )
        },
        {
            title: '配置名',
            dataIndex: 'configName',
            width: 250,
            align: 'center',
            render: (text, record) => (
                <Select
                    disabled
                    value={text}
                    onChange={(e) => updateRow(selectdInfo.applicationId, record.id, 'configName', e)}
                    placeholder="请选择全局环境"
                    style={{ width: '100%' }}
                >
                    <Option key="1" value="1" >配置1</Option>
                    <Option key="2" value="2" >配置2</Option>
                </Select>
            )
        },

        {
            title: '数据库名',
            dataIndex: 'database_name',
            width: 250,
            align: 'center',
            render: (text, record) => (
                <Input
                    disabled
                    value={text}
                    placeholder="请先选择全局环境和配置"
                />
            )
        },
        {
            title: 'IP/端口',
            dataIndex: 'ip',
            width: 300,
            align: 'center',
            render: (text, record) => (
                <Input
                    disabled
                    value={(record.ip && record.port) ? record.ip + ':' + record.port : undefined}
                    placeholder="请先选择全局环境和配置"
                />
            )
        },
    ];

    //. 单环境变更
    const envChange = (e, record) => {
        let ip, port, database_name;
        ip = ipPortInfo[selectdInfo.applicationId]?.[e]?.[record.type]?.[record.configName]?.config_host || undefined;
        port = ipPortInfo[selectdInfo.applicationId]?.[e]?.[record.type]?.[record.configName]?.config_port || undefined;
        database_name = ipPortInfo[selectdInfo.applicationId]?.[e]?.[record.type]?.[record.configName]?.database_name || undefined;
        let updateList = [
            { field: 'env', value: e },
            { field: 'ip', value: ip },
            { field: 'port', value: port },
            { field: 'database_name', value: database_name }
        ];
        batchUpdateRow(selectdInfo.applicationId, record.id, updateList);
    };

    return (
        <div className={styles['nodeType-component']}  >
            <div className={styles['childTable-subTitle']}>
                <div className={styles['table-title']}>{type}</div>
                <div className={styles['table-num']} style={{ color: type === 'APP' ? '#2231e2' : (type === 'FILE' ? '#4da727' : '#9c1ade') }} >{dataList.length} 条</div>
            </div>
            <Table
                rowKey="id"
                columns={type == 'DB' ? DBColumns : AppOrFileColumns}
                dataSource={dataList}
                pagination={false}
            />
        </div>
    )
}

export default connect(({ scriptManagement }) => ({
    scriptManagement,
}))(TableComponent);