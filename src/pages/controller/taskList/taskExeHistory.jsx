import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, } from 'react';
import { Drawer, Tag, Table, Popconfirm, Popover, Input, Button, Spin, Form, Card, Row, Col, Select, Pagination, Upload, message, Icon, Modal } from 'antd';
import styles from './index.less';
import { connect } from 'dva';
import axios from 'axios';
import download from '@/utils/download';
import { values } from 'lodash';
const { Option } = Select;
const TaskExeHistory = (props) => {
    const {
        dispatch,
        dataLoading,
        hisDataLoading,
        detailsRecord,
        detailsModalShow,
        onCancel,
        taskList: { hisExeTableData, hisExePageInfo, hisExeTotal, hisExeWatchTableData, hisExeWatchPageInfo, hisExeWatchTotal },
    } = props;
    const [form] = Form.useForm();
    const { getFieldValue, getFieldsValue, resetFields, validateFields } = form;
    const formItemLayout = {
        labelCol: { span: 7 },
        wrapperCol: { span: 18 }
    };

    const childRef = useRef(null);
    const [drawerVisible, setDrawerVisible] = useState(false);

    // useEffect(() => {
    //     handleSearch({ page: 1, size: 10 });
    // }, []);
    const columns = [
        {
            title: '序号',
            align: 'center',
            // width: 80,
            render: (text, record, index) => {
                return <span>{(hisExePageInfo.current - 1) * hisExePageInfo.pageSize + index + 1}</span>
            }
        },
        {
            title: '脚本名称',
            key: 'case_name',
            dataIndex: 'case_name',
            align: 'center',
            // width: 550,
            // render: (text, record, index) => {

            // }

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
                return (<Tag color={color} key={text} className={styles.tagSizeTable}> {content} </Tag>)
            }
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
            title: '执行耗时',
            key: 'case_elapsed',
            dataIndex: 'case_elapsed',
            align: 'center',
            // width: 550,
        },
        // {
        //     title: '操作',
        //     key: 'taskName',
        //     dataIndex: 'taskName',
        //     align: 'center',
        //     // width: 550,
        //     render: (text, record, index) => (
        //         <Button.Group className={styles.btchBtn}>
        //             <Button
        //                 type="primary"
        //                 // icon={<ContainerOutlined />}
        //                 // style={{ background: '#7cdb14', color: '#ffffff', marginLeft: 15 }}
        //                 onClick={() => { execClick(record) }}
        //             >
        //                 查看
        //             </Button>

        //         </Button.Group >
        //     )
        // },
    ]

    const handleSearch = ({ page, size }) => {
        dispatch({
            type: 'taskList/syncHisExePageInfo',
            pageInfo: {
                current: page,
                pageSize: size
            }
        })
        let payload = {
            batch_code: detailsRecord.batch_code,
            task_code: detailsRecord.task_code,
            order: [
                "-updated_time"
            ],
            page,
            page_size: size,
        };
        dispatch({
            type: 'taskList/QueryExeTaskTableData',
            payload,
        })

        // form.validateFields().then(() => {
        //     setLoading(true);
        //     dispatch({
        //         type: 'productCompare/QueryProdInfo',
        //         params: {
        //             test_environment: form.getFieldValue('env'),
        //             customer_number: form.getFieldValue('custNum'),
        //             customer_account: form.getFieldValue('custAcctNum'),
        //             customer_flag: form.getFieldValue('type'),
        //             card_account: form.getFieldValue('cardNum'),
        //         },
        //         callback: _ => {
        //             setLoading(false);
        //             setSelectedRowKeys([]);
        //             setSelectedRows([]);
        //         }
        //     })

        // }).catch(errors => {
        //     throw errors
        // })
    };
    return (
        <Modal
            title='任务历史详情'
            visible={detailsModalShow}
            width='80%'
            maskClosable={false}
            onCancel={() => onCancel()}
        >

            <Table
                loading={dataLoading}
                columns={columns}
                dataSource={hisExeTableData}
                // scroll={{ x: '1200' }}
                // scroll={{ x: 'max-content' }}
                // rowKey="id"
                pagination={{
                    ...hisExePageInfo,
                    total: hisExeTotal,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSizeOptions: ['5', '10', '20', '40', '50'],
                    showTotal(total, range) {
                        return `${range[0]}-${range[1]}条，共${total}条`
                    },
                }}
                onChange={({ current, pageSize }) => handleSearch({ page: current, size: pageSize })}
            />
            {/* <Drawer
                title="执行历史记录"
                placement="left"
                width='80%'
                closable={true}
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
            >
                <Table
                    loading={hisDataLoading}
                    columns={hisWatchExeColumns}
                    dataSource={hisExeWatchTableData}
                    // scroll={{ x: '1200' }}
                    // scroll={{ x: 'max-content' }}
                    // rowKey="id"
                    pagination={{
                        ...hisExeWatchPageInfo,
                        total: hisExeWatchTotal,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['5', '10', '20', '40', '50'],
                        showTotal(total, range) {
                            return `${range[0]}-${range[1]}条，共${total}条`
                        },
                    }}
                    onChange={({ current, pageSize }) => handleHistorySearch({ page: current, size: pageSize })}
                />
            </Drawer> */}
        </Modal>
    )
}

export default connect(({ taskList, loading }) => ({
    taskList,
    dataLoading: loading.effects['taskList/LogsQuery'],
    hisDataLoading: loading.effects['scriptManagement/QueryHistoryTableData'],
}))(TaskExeHistory);