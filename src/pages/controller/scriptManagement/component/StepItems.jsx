import React, { useEffect, useState } from 'react';
import { Tabs } from "antd";
import StepItem from './StepItem';
import styles from './index.less';

const StepItems = ({stepDatas, onSelectRow, onTransferStatus, rightDisplay}) => {
    const { TabPane } = Tabs;
    const [activeTabs, setActiveTabs] = useState('all');
    const [successTotal, setSuccessTotal] = useState(0);
    const [failedTotal, setFailedTotal] = useState(0);
    const [successTotalItem, setSuccessTotalItem] = useState([]);
    const [failedTotalItem, setFailedTotalItem] = useState([]);
    
    useEffect(() => {
        const result = stepDatas.reduce(
            (acc, cur) => {
                const state = cur.step_state;
                acc.count[state]++;
                acc.items[state].push(cur);
                return acc;
            }, {
                count: { true: 0, false: 0, 2: 0, 3: 0 },
                items: { true: [], false: [], 2: [], 3: [] }
            }
        );
        setSuccessTotal(result.count.true);
        setFailedTotal(result.count.false);
        setSuccessTotalItem(result.items.true);
        setFailedTotalItem(result.items.false);
    }, [stepDatas]);

    return (
        <div>
            <Tabs className={styles.customTabs} tabBarStyle={{ paddingLeft: 60 }} defaultActiveKey="all" activeKey={activeTabs} onChange={e => setActiveTabs(e)}>
                <TabPane
                    tab={
                        <div><span className={styles.customTabFont}>全部</span><span className={styles.tabBadge}>{stepDatas?.length}</span></div>
                    }
                    key="all">
                    <StepItem stepDatas={stepDatas} onSelectRow={onSelectRow} onTransferStatus={onTransferStatus} rightDisplay={rightDisplay} />
                </TabPane>
                <TabPane
                    tab={
                        <span className={styles.customTabFont}>成功<span className={styles.tabBadge}>{successTotal}</span></span>
                    }
                    key="success">
                    <StepItem stepDatas={successTotalItem} onSelectRow={onSelectRow} onTransferStatus={onTransferStatus} rightDisplay={rightDisplay} />
                </TabPane>
                <TabPane
                    tab={
                        <span className={styles.customTabFont}>失败<span className={styles.tabBadge}>{failedTotal}</span></span>
                        }
                    key="failed" >
                    <StepItem stepDatas={failedTotalItem} onSelectRow={onSelectRow} onTransferStatus={onTransferStatus} rightDisplay={rightDisplay} />
                </TabPane>
            </Tabs>
        </div>
    );
};

export default StepItems;