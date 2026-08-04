import React, { useState, useEffect } from 'react';
import { Table, Popover } from 'antd';
import { connect } from 'umi';

const ResultAssert = (props) => {
    const {
        scriptManagement: { responseInfo, selectedNode }
    } = props;

    const [assertData, setAssertData] = useState([]);

    useEffect(() => {
        if (responseInfo?.id === selectedNode.id) {
            responseInfo?.validator_results ? setAssertData(responseInfo?.validator_results) : setAssertData([]);
        }
    }, [responseInfo, selectedNode])

    const columns = [
        {
            title: '断言名称',
            dataIndex: 'name',
            align: 'center',
            // width: 120,
            ellipsis: true,
        },
        {
            title: '断言对象',
            dataIndex: 'source',
            align: 'center',
            // width: 120,
            ellipsis: true,
        },
        {
            title: '断言路径',
            dataIndex: 'expr',
            align: 'center',
            // width: 120,
            ellipsis: true,
        },
        {
            title: '结果值',
            dataIndex: 'actual_value',
            align: 'center',
            // width: 120,
            ellipsis: true,
            render: text => (
                <div>
                    {text ? <Popover content={JSON.stringify(text)}>{JSON.stringify(text)}</Popover> : <span></span>}
                </div>
            )
        },
        {
            title: '断言方式',
            dataIndex: 'operation',
            align: 'center',
            // width: 120,
            ellipsis: true,
        },
        {
            title: '期望值',
            dataIndex: 'except_value',
            align: 'center',
            // width: 120,
            ellipsis: true,
        },
        {
            title: '断言结果',
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

    return (
        <Table
            rowKey="id"
            size="small"
            columns={columns}
            dataSource={assertData}
            pagination={false}
        />
    )
};

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(ResultAssert);
// export default ResultAssert;