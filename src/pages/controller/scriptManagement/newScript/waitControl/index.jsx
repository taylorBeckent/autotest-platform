import React, { useState, useEffect } from 'react';
import { InputNumber, Card } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import styles from './index.less';
import { connect } from 'umi';
import utils from '../../utils';

const WaitControl = (props) => {

    const {
        dispatch,
        scriptManagement: { stepTreeList, selectedNode }
    } = props;

    const [timeVal, setTimeVal] = useState();

    useEffect(() => {
        setTimeVal(selectedNode?.wait || 0);
    }, []);

    const timeChange = (e) => {
        setTimeVal(e);

        updateTreeList([{ insertKey: 'wait', insertValue: e }]);
    };

    //. 更新树结构
    const updateTreeList = (insertList) => {
        let finalList = utils.recurseTreeList(stepTreeList, insertList, selectedNode);
        dispatch({
            type: 'scriptManagement/syncStepTreeList',
            stepTreeList: finalList
        })
    }

    return (
        <div className={styles['container']}>
            <div className={styles['header']}>
                <ClockCircleOutlined style={{ color: '#23e023', marginRight: 10 }} />
                等待时间
            </div>
            <div className={styles['content']}>
                <InputNumber style={{ marginLeft: 50, marginTop: 30 }} value={timeVal} onChange={timeChange} disabled={selectedNode?.isQuote} /> s
            </div>
        </div>
    )
}

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(WaitControl);
// export default WaitControl;