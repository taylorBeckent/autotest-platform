import React, { useEffect, useState } from 'react';
import { connect } from 'umi';
import { Table, Button, Select, Spin, Popover, Dropdown, Menu, Popconfirm, message } from 'antd';
import styles from './index.less';
import { generateUUID } from '@/utils/utils';
import { CloudServerOutlined, FilePdfOutlined, DeleteOutlined, EditOutlined, CopyOutlined } from '@ant-design/icons';
import ChildEditModal from './ChildEditModal';

const ChildTable = (props) => {

    const {
        dispatch,
        currentRecord,
        currentData,
        expandedFlag,
        childCtrl,
        callback
    } = props;

    useEffect(() => {
        if (expandedFlag) {
            handleSearch({ current: 1, pageSize: 10 });
        };
    }, [expandedFlag]);

    useEffect(() => {
        if (childCtrl.flag === 'refresh' && childCtrl.id === currentRecord.id) {
            callback('none');
            handleRefresh();
        }
    }, [childCtrl])

    const [childLoading, setChildLoading] = useState(false);//.子表loading
    const [modalShow, setModalShow] = useState('closed');
    const [childRecord, setChildRecord] = useState();

    const handleRefresh = () => {
        let { current, pageSize } = currentRecord.detailVOList?.childPageInfo;
        handleSearch({ current, pageSize });
    };

    //.展开子表
    const handleSearch = ({ current, pageSize }) => {
        setChildLoading(true);
        let params = {
            env_info_id: currentRecord?.project_id,
            env_name: currentRecord?.env_name,
            env_type: currentRecord?.env_type,
            page: current,
            page_size: pageSize
        };

        dispatch({
            type: 'envManagement/SearchConfigList',
            payload: params,
            childPageInfo: { current, pageSize },
            callback: _ => { setChildLoading(false) }
        });
    };

    const columns = [
        {
            title: '配置名称',
            dataIndex: 'config_name',
            key: 'config_name',
            align: 'center',
            width: 130,
        },
        {
            title: 'IP',
            dataIndex: 'ip',
            key: 'ip',
            align: 'center',
            width: 150,
            ellipsis: true
        },
        {
            title: '端口',
            key: 'port',
            dataIndex: 'port',
            align: 'center',
            width: 80,
            ellipsis: true
        },
        {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
            align: 'center',
            width: 150,
            ellipsis: true
        },
        {
            title: '维护人',
            dataIndex: 'maintainer',
            key: 'maintainer',
            align: 'center',
            width: 90,
            ellipsis: true
        },
        {
            title: '维护时间',
            dataIndex: 'updated_time',
            key: 'updated_time',
            align: 'center',
            width: 150,
            ellipsis: true
        },
        {
            title: '操作',
            align: 'center',
            width: 110,
            fixed: 'right',
            render: (text, record) => {
                return (
                    <Button.Group className={styles.btchBtn}>
                        <Popover content='编辑'>
                            <Button icon={<EditOutlined />} type="link" onClick={() => addEditModal(record, 'edit')} />
                        </Popover>

                        <Popover content='复制'>
                            <Button icon={<CopyOutlined />} type="link" onClick={() => addEditModal(record, 'copy')} />
                        </Popover>

                        <Popconfirm title="请确认是否删除该条数据？" style={{ marginRight: '15px' }} onConfirm={() => { handleDelete(record) }}>
                            <Button type="link" icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Button.Group >
                )
            }
        },
    ];

    const addEditModal = (record, scene) => {
        setChildRecord({ ...record, project_id: currentRecord?.project_id, env_name: currentRecord?.env_name, env_type: currentRecord?.env_type });
        setModalShow(scene);
    };

    const handleDelete = (record) => {
        setChildLoading(true);
        dispatch({
            type: 'envManagement/ConfigDelete',
            payload: {
                id: record.id,
                env_type: currentRecord.env_type
            },
            callback: flag => {
                if (flag === 'success') {
                    handleRefresh();
                }
            }
        });
    };

    const handlePageChange = ({ current, pageSize }) => {
        dispatch({
            type: 'envManagement/ChildPageChange',
            payload: {
                id: currentRecord?.id || '',
                project_id: currentRecord?.project_id || '',
                env_name: currentRecord?.env_name || '',
                env_type: currentRecord?.env_type || '',
            },
            currentPageInfo: {
                current,
                pageSize
            }
        })
        handleSearch({ current, pageSize });
    };

    return (
        <div className={styles.content}>
            <div className={styles.tableContent}>
                <Table
                    key={generateUUID()}
                    columns={columns}
                    dataSource={currentData}
                    loading={childLoading}
                    rowKey="id"
                    scroll={{ x: '10%' }}
                    pagination={{
                        ...currentRecord.detailVOList?.childPageInfo,
                        total: currentRecord.detailVOList?.childTotal,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal(total, range) {
                            return `${range[0]}-${range[1]}条 共 ${total} 条`;
                        },
                    }}
                    onChange={handlePageChange}
                />
            </div>

            {modalShow !== 'closed' && (
                <ChildEditModal
                    modalShow={modalShow}
                    nodeType={currentRecord?.env_type}
                    currentRecord={childRecord}
                    onCancel={flag => {
                        setModalShow('closed');
                        if (flag === 'success') {
                            handleRefresh();
                        }
                    }}
                />
            )}
        </div>
    )
}

export default connect(({ envManagement }) => ({
    envManagement
}))(ChildTable);