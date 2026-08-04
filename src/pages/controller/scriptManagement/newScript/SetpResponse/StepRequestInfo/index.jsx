import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'umi';
import { Collapse } from 'antd';
import styles from '../StepResponseInfo/index.less';

const { Panel } = Collapse;

const StepRequestInfo = (props) => {
    const {
        scriptManagement: { responseInfo, selectedNode }
    } = props;
    const [displayHeader, setDisplayHeader] = useState(false)

    const [bodyData, setBodyData] = useState();
    const [headerData, setHeaderData] = useState();

    function shouldShowHeaderForNode(record) {
        return record.nodeType === 2;
    }

    useEffect(() => {
        const shouldShoeHeader = shouldShowHeaderForNode(selectedNode);
        setDisplayHeader(shouldShoeHeader);
        if (responseInfo?.id === selectedNode.id) {
            //. body
            if (responseInfo?.request_info?.body) {
                let bodyStr = JSON.stringify(responseInfo?.request_info?.body, null, 2);
                setBodyData(bodyStr);
            } else {
                setBodyData('null');
            }
            //. header
            if (shouldShoeHeader && responseInfo?.request_info?.headers) {
                let headerStr = JSON.stringify(responseInfo?.request_info?.headers, null, 2);
                setHeaderData(headerStr);
            } else {
                setHeaderData('null');
            }
        }
    }, [responseInfo, selectedNode])

    return (
        <div >
            <Collapse defaultActiveKey="Body">
                <Panel header="Body" key="Body">
                    <div className={styles['header']}>
                        {bodyData}
                    </div>
                </Panel>
                {displayHeader && <Panel header="Header" key="Header">
                    <div className={styles['header']}>
                        {headerData}
                    </div>
                </Panel>}
            </Collapse>


        </div>
    )
}

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(StepRequestInfo);
// export default StepRequestInfo;