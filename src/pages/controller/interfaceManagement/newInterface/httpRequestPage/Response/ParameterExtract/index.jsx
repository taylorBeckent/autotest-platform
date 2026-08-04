import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import { connect } from 'umi';
import { SnippetsOutlined } from '@ant-design/icons';
// import ExtractModal from '@/pages/controller/scriptManagement/newScript/httpRequestPage/Response/ParameterExtract/ExtractModal';
import ExtractModal from './ExtractModal';

const ParameterExtract = (props) => {
    const {
        scriptManagement: { responseInfo }
    } = props;

    const [extractData, setExtractData] = useState([]);
    const [modalStatus, setModalStatus] = useState('closed');
    const [currentData, setCurrentData] = useState('');

    useEffect(() => {
        responseInfo?.extract_results ? setExtractData(responseInfo?.extract_results) : setExtractData([]);
    }, [responseInfo])

    const columns = [
        {
            title: '变量名',
            dataIndex: 'name',
            align: 'center',
            // width: 120,
            ellipsis: true,
        },
        {
            title: '提取来源',
            dataIndex: 'source',
            align: 'center',
            // width: 120,
            ellipsis: true,
        },
        {
            title: '表达式',
            dataIndex: 'expr',
            align: 'center',
            // width: 120,
            ellipsis: true,
        },
        {
            title: '提取值',
            dataIndex: 'extract_value',
            align: 'center',
            // width: 120,
            ellipsis: true,
            render: text => {
                return (
                    <a onClick={() => { setModalStatus('open'); setCurrentData(text); }} >{JSON.stringify(text)}</a>
                )
            }
        },
        {
            title: '提取结果',
            dataIndex: 'success',
            align: 'center',
            // width: 120,
            ellipsis: true,
            render: text => (
                <div>
                    {text ? <span>成功</span> : <span>失败</span>}
                </div>
            )
        },
        {
            title: '错误信息',
            dataIndex: 'error',
            align: 'center',
            // width: 120,
            ellipsis: true,
        }
    ];

    //.服务器复制
    const handleCopy = (copyVal) => {
        const textArea = document.createElement("textarea");
        textArea.value = copyVal;
        textArea.style.position = 'absolute';
        textArea.style.opacity = '0';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        if (!document.execCommand('copy')) {
            throw new Error('Copy command failed');
        }
        textArea.remove();
    };

    return (
        <>
            <Table
                rowKey="id"
                size="small"
                columns={columns}
                dataSource={extractData}
                pagination={false}
            />
            {modalStatus !== 'closed' && (
                <ExtractModal
                    status={modalStatus}
                    currentData={currentData}
                    onCancel={() => {
                        setModalStatus('closed')
                    }}
                />
            )}
        </>
    )
};

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(ParameterExtract);