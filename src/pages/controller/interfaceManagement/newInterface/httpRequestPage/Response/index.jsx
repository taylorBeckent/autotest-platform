import React, { useEffect, useState, useRef } from 'react';
import { Tabs } from 'antd';
import styles from './index.less';
import ResponseInfo from './ResponseInfo';
import RequestInfo from './RequestInfo';
import ResultAssert from './ResultAssert';
import ParameterExtract from './ParameterExtract';
import RunningLog from './RunningLog';
import { connect } from 'umi';

const { TabPane } = Tabs;

const HttpRequest = (props) => {

    const [curResponseInfo, setCurResponseInfo] = useState({});

    return (
        <div className={styles['response-container']}>
            <div className={styles['response-header']}>Response</div>
            <div className={styles['response-body']}>
                <Tabs defaultActiveKey="responseInfo" tabBarGutter={40} >
                    <TabPane tab="响应信息" key="responseInfo">
                        <ResponseInfo />
                    </TabPane>
                    <TabPane tab="请求信息" key="requestInfo">
                        <RequestInfo />
                    </TabPane>
                    <TabPane tab="参数提取" key="parameterExtract">
                        <ParameterExtract />
                    </TabPane>
                    <TabPane tab="结果断言" key="assert">
                        <ResultAssert />
                    </TabPane>
                    <TabPane tab="运行日志" key="runningLog">
                        <RunningLog />
                    </TabPane>
                </Tabs>
            </div>
        </div>
    )
}

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(HttpRequest);
// export default HttpRequest;