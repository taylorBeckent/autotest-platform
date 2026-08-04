import React, { useState, useEffect } from 'react';
import { Button, Table, Tag } from 'antd';
import { connect } from 'umi';
import styles from './index.less';
import HistoryWatch from '../../historyWatch';

const DetailDrawer = (props) => {
    const {
        dispatch,
        onClose,
        activeTabs,
        refreshDebugLog,
        onRefreshDebugLog,
        scriptManagement: { caseInfo, hisTableData, hisPageInfo, hisTotal }
    } = props;

    const [loading, setLoading] = useState(false);
    const [exeDetailModalShow, setExeDetailModalShow] = useState(false);
    const [currentExeRecord, setCurrentExeRecord] = useState();

    useEffect(() => {
        activeTabs == 'debugRecord' && handleDetailSearch({ page: 1, size: 10 });
    }, [activeTabs]);

    useEffect(() => {
        refreshDebugLog && activeTabs == 'debugRecord' && handleDetailSearch({ page: 1, size: 10 });
    }, [refreshDebugLog])

    const hisColumns = [
        {
            title: '序号',
            align: 'center',
            // width: 80,
            render: (text, record, index) => {
                return <span>{(hisPageInfo.current - 1) * hisPageInfo.pageSize + index + 1}</span>
            }
        },
        {
            title: '脚本名称',
            key: 'case_name',
            dataIndex: 'case_name',
            align: 'center',
        },

        {
            title: '执行结果',
            key: 'case_state',
            dataIndex: 'case_state',
            align: 'center',
            render: (text, record, index) => {
                let color, content;
                switch (text) {
                    case false:
                        color = 'volcano';
                        content = '失败'
                        break;
                    case true:
                        color = 'green';
                        content = '成功'
                        break;
                    case '2':
                        color = 'blue';
                        content = '进行中'
                        break;
                    case '3':
                        color = 'blue';
                        content = '中止'
                        break;
                }
                return (<Tag color={color} key={text} > {content} </Tag>)
            }
            // width: 550,
        },
        {
            title: '步骤数',
            key: 'step_total',
            dataIndex: 'step_total',
            align: 'center',
            // width: 550,
        },
        {
            title: '成功数',
            key: 'step_pass_count',
            dataIndex: 'step_pass_count',
            align: 'center',
            // width: 550,
        },
        {
            title: '通过率',
            key: 'step_pass_ratio',
            dataIndex: 'step_pass_ratio',
            align: 'center',
            // width: 550,
        },
        {
            title: '执行时间',
            key: 'case_st_time',
            dataIndex: 'case_st_time',
            align: 'center',
            width: 200,
            render: (text, record, index) => {
                return <span>{text.split('.')[0]}</span>
            }
        },
        {
            title: '执行耗时',
            key: 'case_elapsed',
            dataIndex: 'case_elapsed',
            align: 'center',
            // width: 550,
            render: (text, record, index) => {
                return <span>{text}s</span>
            }
        },
        {
            title: '操作',
            align: 'center',
            // width: 550,
            render: (text, record, index) => (
                <Button.Group>
                    <Button
                        type="primary"
                        onClick={() => { execClick(record) }}
                    >
                        查看
                    </Button>

                </Button.Group >
            )
        },
    ];

    const execClick = (record) => {
        setCurrentExeRecord(record)
        setExeDetailModalShow(true)
    }

    const handleDetailSearch = ({ page, size }) => {
        dispatch({
            type: 'scriptManagement/syncHistoryPageInfo',
            pageInfo: {
                current: page,
                pageSize: size
            }
        });

        let payload = {
            page,
            page_size: size,
            case_id: caseInfo.case_id,
            case_code: caseInfo.case_code,
            report_type: '调试执行',
            case_id: caseInfo.case_id,
            order: [
                "-updated_time"
            ]
        };

        setLoading(true);
        dispatch({
            type: 'scriptManagement/QueryHistoryTableData',
            payload,
            callback: _ => {
                setLoading(false);
                onRefreshDebugLog(false);
            }
        })
    };

    return (
        <div className={styles['detail-drawer-container']}>
            <Table
                loading={loading}
                columns={hisColumns}
                dataSource={hisTableData}
                pagination={{
                    ...hisPageInfo,
                    total: hisTotal,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSizeOptions: ['5', '10', '20', '40', '50'],
                    showTotal(total, range) {
                        return `${range[0]}-${range[1]}条，共${total}条`
                    },
                }}
                onChange={({ current, pageSize }) => handleDetailSearch({ page: current, size: pageSize })}
            />

            {exeDetailModalShow ? <HistoryWatch
                exeDetailModalShow={exeDetailModalShow}
                currentExeRecord={currentExeRecord}
                onCancel={() => { setExeDetailModalShow(false) }}
            /> : null}
        </div>
    )
}

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(DetailDrawer);