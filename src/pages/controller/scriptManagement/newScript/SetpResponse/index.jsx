import React from 'react';
import { Tabs } from 'antd';
import styles from './index.less';
import SetpRunningLog from './StepRunningLog';
import StepResponseInfo from  './StepResponseInfo';
import StepRequestInfo from './StepRequestInfo';
import StepResultAssert from './StepResultAssert';
import { connect } from 'umi';

const { TabPane } = Tabs;

const SetpResponses = (props) => {
    return (
        <div className={styles['response-container']}>
            <div className={styles['response-header']}>Response</div>
            <div className={styles['response-body']}>
                <Tabs defaultActiveKey="stepResponseInfo" tabBarGutter={40} >
                    <TabPane tab="响应信息" key="stepResponseInfo">
                        <StepResponseInfo />
                    </TabPane>
                    <TabPane tab="请求信息" key="sstepRequestInfo">
                        <StepRequestInfo />
                    </TabPane>
                    <TabPane tab="结果断言" key="assert">
                        <StepResultAssert />
                    </TabPane>
                    <TabPane tab="运行日志" key="stepRunningLog">
                        <SetpRunningLog />
                    </TabPane>
                </Tabs>
            </div>
        </div>
    )
}

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(SetpResponses);
// export default SetpResponses;