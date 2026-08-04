import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col } from 'antd';
import { connect } from 'dva';
import ReportDetailRight from './component/ReportDetailRight';
import StepItems from './component/StepItems';
import MessageCompare from './component/MessageCompare';

const HistoryDetail = (props) => {
    const {
        dispatch,
        dataLoading,
        currentExeRecord,
        screenName,
        exeDetailModalShow,
        onCancel,
        scriptManagement: { hisDetailPageInfo, hisDetailTableData, hisDetailTotal },
    } = props;
    const [selectedRow, setSelectedRow] = useState(null);
    const [rightDisplay, setRightDisplay] = useState(false);
    const [transferStatus, setTransferStatus] = useState({});

    useEffect(() => {
        handleSearch({ page: 1, size: 100 });
    }, []);

    const handleSearch = ({ page, size }) => {
        dispatch({
            type: 'scriptManagement/syncHIstoryDetailPageInfo',
            pageInfo: {
                current: page,
                pageSize: size,

            }
        })
        let payload = {
            page,
            page_size: size,
            case_id: currentExeRecord?.case_id,
            case_code: currentExeRecord?.case_code,
            report_code: currentExeRecord?.report_code,
            state: '0',
            order: [
                "step_no",
                "-updated_time"
            ]
        };
        dispatch({
            type: 'scriptManagement/QueryHistoryDetailTableData',
            payload,
        })
    };

    function handleSelectRow(row) {
        setSelectedRow(row);
        setRightDisplay(true);
    }

    function handleCloseSelect() {
        setRightDisplay(false);
    }

    return (
        <Modal
            title='报告详情'
            visible={exeDetailModalShow}
            width='95%'
            maskClosable={false}
            onCancel={() => onCancel()}
            footer={[
                <>
                    <Button type="primary" onClick={() => onCancel()} >关闭</Button>
                </>
            ]}
        >
            {screenName && <Row style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: 20, fontSize: 14, fontWeight: 400 }}><Col span={1} /><h3>场景: {screenName}</h3></Row>}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: rightDisplay ? '40%' : '100%', marginRight: 10 }}>
                    <StepItems stepDatas={hisDetailTableData} onSelectRow={handleSelectRow} onTransferStatus={setTransferStatus} rightDisplay={rightDisplay} />
                </div>
                {rightDisplay && (selectedRow?.step_type == "报文比对" ?
                    <MessageCompare selectedRecord={selectedRow}  />
                    : <ReportDetailRight selectedRecord={selectedRow} transferStatus={transferStatus} closeReportDetail={handleCloseSelect} />)}
            </div>
        </Modal>
    )
}

export default connect(({ scriptManagement, loading }) => ({
    scriptManagement,
    dataLoading: loading.effects['scriptManagement/QueryHistoryDetailTableData'],
}))(HistoryDetail);