import react, { useState, useEffect } from 'react';
import { connect } from 'umi';
import styles from './index.less';

const Empty = (props) => {
    const {
        scriptManagement: { selectedNode }
    } = props;

    const [content, setContent] = useState();

    const contentMap = {
        'commonVariables': '用户变量模块',
        'wait': '等待控制模块',
        'quote': '引用的公共接口/脚本'
    };

    useEffect(() => {
        if (selectedNode.nodeType == 0 && selectedNode.content === '用户变量') { setContent(contentMap['commonVariables']) }
        if (selectedNode.nodeType == 3 && selectedNode.content === '等待控制') { setContent(contentMap['wait']) }
        if (selectedNode.isQuote) { setContent(contentMap['quote']) }
    }, [selectedNode]);

    return (
        <div className={styles['empty-style']}>
            {content}暂时无法使用数据驱动
        </div>
    )
}

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(Empty);