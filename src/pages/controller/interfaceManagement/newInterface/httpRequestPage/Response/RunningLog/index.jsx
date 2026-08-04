import React, { useState, useEffect } from 'react';
import styles from './index.less';
import { connect } from 'umi';

const text = `[2026-01-14 16:08:26] [HTTP请求] 开始 +
[2026-01-14 16:08:26] [HTTP请求] 错误： 缺少基本的url 请检查url是否正确
[2026-01-14 16:08:26] [HTTP请求] 结束 \n`;

const RunningLog = (props) => {

    const {
        scriptManagement: { responseInfo }
    } = props;

    const [context, setContext] = useState();

    useEffect(() => {
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
    }, [responseInfo])

    return (
        <div className={styles['log-style']}>
            {context}
        </div>
    )
};

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(RunningLog);
// export default RunningLog;