import React from 'react';
import { Tabs } from 'antd';
import styles from './index.less';
import RequestBody from './RequestBody';
import RequestHeader from './RequestHeader';
import VariableTable from './VariableTable';
import Extract from './Extract';
import AssertRule from './AssertRule';
import { connect } from 'umi';

const { TabPane } = Tabs;

const HttpRequest = (props) => {
    const {
        dispatch,
        scriptManagement: { stepTreeList, selectedNode }
    } = props;
    return (
        <div className={styles['request-container']}>
            <div className={styles['request-header']}>Request</div>
            <div className={styles['request-body']}>
                <Tabs defaultActiveKey="requestBody" tabBarGutter={40} >
                    <TabPane tab="请求体" key="requestBody">
                        <RequestBody />
                    </TabPane>
                    {selectedNode.nodeType == '2' ?
                        <TabPane tab="请求头" key="requestHeader">
                            <RequestHeader />
                        </TabPane> : null
                    }
                    <TabPane tab="局部变量" key="variable">
                        <VariableTable />
                    </TabPane>
                    <TabPane tab="提取" key="extract">
                        <Extract />
                    </TabPane>
                    <TabPane tab="断言" key="assert">
                        <AssertRule />
                    </TabPane>
                </Tabs>
            </div>
        </div>
    )
}

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(HttpRequest);