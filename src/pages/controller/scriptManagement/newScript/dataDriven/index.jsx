import React, { useState, useEffect } from 'react';
import { Button, Result, Checkbox, Table, Upload, message, Modal, Popconfirm, Popover } from 'antd';
import { HighlightOutlined, DeleteOutlined, PicRightOutlined, EyeOutlined } from '@ant-design/icons';
import { connect } from 'umi';
import moment from 'moment';
import download from '@/utils/download';
import utils from '../../utils';
import styles from './index.less';

const DataDriven = (props) => {

    const {
        dispatch,
        onLoading,
        scriptManagement: { caseInfo, selectedNode, stepTreeList, dataDrivenTableList }
    } = props;

    const [checkPoint, setCheckPoint] = useState([]); //. 校验点
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [failModalStatus, setFailModalStatus] = useState(false); //. 失败原因查看
    const [failedReason, setFailedReason] = useState(); //. 失败原因

    useEffect(() => {
        handleInit();
    }, [selectedNode]);

    const columns = [
        {
            title: '文档名称',
            key: 'file_name',
            dataIndex: 'file_name',
            align: 'center',
            width: 160,
            ellipsis: true,
            render: (text, record) => (
                <a onClick={() => {
                    let formData = new FormData();
                    formData.append('create_code', record?.create_code);
                    setLoading(true);
                    download.postGetExcelSync('/database/lb/autotest/download-create', formData, () => { setLoading(false) });
                }} >{text}</a>
            )
        },
        {
            title: '状态',
            key: 'create_status',
            dataIndex: 'create_status',
            align: 'center',
            width: 80,
            render: text => {
                let str = '';
                switch (text) {
                    case 0:
                        str = '提交';
                        break;
                    case 1:
                        str = '生成钟';
                        break;
                    case 2:
                        str = '失败';
                        break;
                    case 3:
                        str = '成功';
                        break;
                };
                return str;
            }
        },
        {
            title: '耗时',
            key: 'consuming',
            dataIndex: 'consuming',
            align: 'center',
            width: 80,
            render: (text, record) => {
                if (record?.updated_time) {
                    return formatTimeDiff(record);
                } else {
                    return '';
                }
            }
        },
        {
            title: '提交时间',
            key: 'created_time',
            dataIndex: 'created_time',
            align: 'center'
        },
        {
            title: '完成时间',
            key: 'updated_time',
            dataIndex: 'updated_time',
            align: 'center'
        },
        {
            title: '操作',
            align: 'center',
            render: (text, record) => {
                return (
                    <Button.Group className={styles.btnStyles}>
                        <Popconfirm title="是否删除该文件？" style={{ marginRight: '15px' }} onConfirm={() => { handleDelete(record) }}>
                            <Button
                                type="link"
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>

                        <Popover content="失败原因查看">
                            <Button
                                type="link"
                                disabled={record?.create_status != 2}
                                icon={<EyeOutlined />}
                                onClick={() => {
                                    setFailModalStatus(true);
                                    setFailedReason(record?.file_desc);
                                }}
                            />
                        </Popover>
                    </Button.Group>
                )
            }
        },
    ];

    //. 计算耗时
    const formatTimeDiff = (record) => {
        const start = moment(record?.created_time, 'YYYY-MM-DD HH:mm:ss');
        const end = moment(record?.updated_time, 'YYYY-MM-DD HH:mm:ss');

        const diffMs = end.diff(start);
        const duration = moment.duration(diffMs);

        const totalSeconds = Math.abs(duration.asSeconds());

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        const parts = [];

        if (hours > 0) {
            parts.push(`${hours}h`);
        }

        if (minutes > 0 || hours > 0) {
            parts.push(`${minutes}m`);
        }

        parts.push(`${seconds}s`);

        return parts.join(' ');
    };

    //. 校验点类型
    const syncCheckOptions = [
        { label: '必输性', value: '0' },
        { label: '字段长度', value: '1' },
        { label: '枚举值', value: '2' },
        // { label: '小数点位数', value: '2' },
        { label: '小数字段边界值', value: '3' },
    ];

    const handleInit = () => {
        setCheckPoint([]);
        onRemove();
    };

    const singleBeforeUpload = () => {
        if (!selectedNode?.step_code) {
            message.error('该步骤暂未保存，请先保存脚本后再进行上传操作');
            return false;
        } else {
            return true;
        }
    };

    //. 单步骤上传
    const singleStepUpload = (info) => {
        if (info.file.status !== 'uploading') { }
        if (info.file.status === 'done') {
            const res = info.file.response;
            if (res?.code === '000000') {
                updateTreeList([{ insertKey: 'file_name', insertValue: res?.data?.file_name }]);
                updateSelectedNode(res?.data?.file_name);
                message.success('上传已完成！');
            } else {
                message.error(res?.message);
            }

            return;
        }
    };

    //. 删除数据驱动文件
    const deleteDrivenFile = () => {
        if (selectedNode?.step_code) {
            dispatch({
                type: 'scriptManagement/DeleteSource',
                params: {
                    step_code: selectedNode?.step_code
                },
                callback: flag => {
                    if (flag == 'success') {
                        updateTreeList([{ insertKey: 'file_name', insertValue: null }]);
                        updateSelectedNode(null);
                    }
                }
            })
        } else {
            message.error('该步骤暂未保存，请先保存脚本后再进行上传操作');
        }
    };

    //. 下载数据源模板
    const downloadTemplate = (type) => {
        let formData = new FormData();
        if (type === 'interface') {
            formData.append('file_type', '0');
        } else if (type === 'dataDriven') {
            formData.append('file_type', '1');
        }
        onLoading('loading');
        download.postGetExcelSync('/database/lb/autotest/download-temple', formData, () => { onLoading('end') });
    };

    //. 下载上传后的数据源文件
    const downloadUploadFile = () => {
        let formData = new FormData();
        formData.append('step_code', selectedNode?.step_code);
        formData.append('step_name', selectedNode?.content);
        formData.append('case_name', caseInfo?.case_name);
        onLoading('loading');
        download.postGetExcelSync('/database/lb/autotest/download-step', formData, () => { onLoading('end') });
    };

    //. 更新整个树结构-对应节点修改
    const updateTreeList = (insertList) => {
        let finalList = utils.recurseTreeList(stepTreeList, insertList, selectedNode);
        dispatch({
            type: 'scriptManagement/syncStepTreeList',
            stepTreeList: finalList
        })
    };

    //. 更新当前选中节点
    const updateSelectedNode = (fileName) => {
        let selectedCopy = JSON.parse(JSON.stringify(selectedNode));
        selectedCopy.file_name = fileName;

        dispatch({
            type: 'scriptManagement/syncSelectedNode',
            selectedNode: selectedCopy
        })
    };

    const onRemove = () => {
        setFileList([]);
        return true;
    };

    //. 生成测试文件
    const generateDataDriven = () => {
        if (!selectedNode?.step_code) {
            message.error('该步骤暂未保存，请先保存脚本后再进行上传操作');
            return;
        }

        if (fileList.length === 0) {
            message.error('请先上传接口文档');
            return;
        }

        if (checkPoint.length === 0) {
            message.error('请先选择数据校验点');
            return;
        }

        let formData = new FormData();
        formData.append('case_id', caseInfo?.case_id);
        formData.append('step_id', selectedNode?.step_id);
        formData.append('step_code', selectedNode?.step_code);
        formData.append('step_name', selectedNode?.content);
        formData.append('rules_list', checkPoint.toString());
        formData.append('file', fileList[0].originFileObj);
        setLoading(true);
        dispatch({
            type: 'scriptManagement/UploadCreate',
            params: formData,
            callback: flag => {
                if (flag === 'success') {
                    dispatch({
                        type: 'scriptManagement/QueryCreate',
                        params: {
                            step_code: selectedNode.step_code
                        },
                        callback: _ => { setLoading(false); }
                    })
                } else {
                    setLoading(false);
                }
            }
        })
    };

    //. 删除生成文件
    const handleDelete = (record) => {
        dispatch({
            type: 'scriptManagement/DeleteCreate',
            params: {
                create_code: record.create_code,
                step_code: selectedNode.step_code
            },
            callback: flag => {
                if (flag === 'success') {
                    setLoading(true);
                    dispatch({
                        type: 'scriptManagement/QueryCreate',
                        params: {
                            step_code: selectedNode.step_code
                        },
                        callback: _ => { setLoading(false); }
                    })
                }
            }
        })
    };

    const interfaceBeforeUpload = (file) => {
        if (file.name.indexOf('xlsx') === -1) {
            setFileList([]);
            message.error('仅支持上传.xls, .xlsx类型文件');
            return Upload.LIST_IGNORE;
        } else {
            return false;
        }
    }

    return (
        <div>
            <div className={styles['data-file-field']}>
                步骤测试数据上传：
                <Upload
                    accept=".xlsx, .xls"
                    action="/database/lb/autotest/upload-step"
                    showUploadList={false}
                    beforeUpload={singleBeforeUpload}
                    onChange={singleStepUpload}
                    maxCount={1}
                    withCredentials
                    data={{
                        case_id: caseInfo?.case_id,
                        case_code: caseInfo?.case_code,
                        step_id: selectedNode?.step_id,
                        step_code: selectedNode?.step_code,
                        step_name: selectedNode?.content,
                    }}
                >
                    <Button style={{ marginLeft: 20 }} type="primary" >上传</Button>
                </Upload>

                <Button style={{ marginLeft: 20 }} onClick={() => { downloadTemplate('dataDriven') }} >数据模板</Button>
            </div>

            <div className={styles['data-file-field']}>
                最新上传的测试数据文档：
                <a style={{ marginLeft: 20 }} onClick={downloadUploadFile} >{selectedNode?.file_name}</a>
                {selectedNode?.file_name && <Button style={{ marginLeft: 20 }} type="link" icon={<DeleteOutlined />} onClick={deleteDrivenFile} />}
            </div>

            <div className={styles['test-data-generate']}>
                <span id={styles['test-data-generate-title']}>测试数据生成</span>
                <Table loading={loading} columns={columns} dataSource={dataDrivenTableList} />
                <div className={styles['interface-file-field']}  >
                    接口文档：

                        <Upload
                        accept={'.xls,.xlsx'}
                        // beforeUpload={() => false}
                        beforeUpload={interfaceBeforeUpload}
                        showUploadList={true}
                        maxCount={1}
                        fileList={fileList}
                        onRemove={onRemove}
                        withCredentials
                        onChange={(e) => {
                            const { file, fileList } = e;
                            setFileList(fileList);
                        }}
                    >
                        <Button style={{ marginLeft: 20 }} type="primary" >上传</Button>
                    </Upload>
                    <Button style={{ marginLeft: 20 }} onClick={() => { downloadTemplate('interface') }} >接口模板</Button>
                </div>
                <div>
                    <div id={styles['test-data-generate-title']}>数据校验点</div>

                    <Checkbox.Group
                        style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 20 }}
                        options={syncCheckOptions}
                        value={checkPoint}
                        onChange={e => { setCheckPoint(e) }}
                    />
                </div>

                <div style={{ marginTop: 40 }}>
                    <div className={styles['test-data-generate-tips']}>注：数据类型为list、array的字段，不支持生成测试数据 </div>
                    <Button icon={<HighlightOutlined />} style={{ backgroundColor: "rgb(24 144 255)", color: "#fff", borderRadius: 10 }} ghost block onClick={generateDataDriven} >生成</Button>
                </div>
            </div>

            <Modal
                title={null}
                visible={failModalStatus}
                width={300}
                maskClosable={false}
                onCancel={() => { setFailModalStatus(false) }}
                footer={null}
            >
                失败原因：{failedReason}
            </Modal>
        </div>
    )
}

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(DataDriven);