import React from 'react';
import { Tabs } from 'antd';
import styles from './index.less';
import StepAssertRule from './StepAssertRule';
import CodeBody from './CodeBody';

const { TabPane } = Tabs;

const StepRequests = () => {
    return (
        <div className={styles['request-container']}>
            <div className={styles['request-header']}>Request</div>
            <div className={styles['request-body']}>
                <Tabs defaultActiveKey="stepRequestCode" tabBarGutter={40} >
                    <TabPane tab="Code" key="stepRequestCode">
                        <CodeBody />
                    </TabPane>
                    <TabPane tab="断言规则" key="stepAssert">
                        <StepAssertRule />
                    </TabPane>
                </Tabs>
            </div>
        </div>
    )
}

export default StepRequests;