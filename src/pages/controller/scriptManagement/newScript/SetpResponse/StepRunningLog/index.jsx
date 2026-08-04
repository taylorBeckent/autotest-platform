import React, { useState, useEffect } from 'react';
import styles from './index.less';
import { connect } from 'umi';

const SetpRunningLog = (props) => {

    const {
        scriptManagement: { responseInfo, selectedNode }
    } = props;

    const [context, setContext] = useState();

    useEffect(() => {
        if (responseInfo?.id === selectedNode.id) {
            if (responseInfo?.logs && responseInfo?.logs.length > 0) {
                let str = ``;
                responseInfo?.logs.map(item => {
                    str += item;
                    str += `\n`
                });

                setContext(str);
            } else {
                setContext('');
            }
        }
    }, [responseInfo, selectedNode])

    return (
        <div className={styles['log-style']}>
            {context}
        </div>
    )
};

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(SetpRunningLog);
// export default SetpRunningLog;