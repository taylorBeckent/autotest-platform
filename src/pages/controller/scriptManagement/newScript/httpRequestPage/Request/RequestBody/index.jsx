import React, { useState, useEffect } from 'react';
import { Tabs, Radio } from 'antd';
import { connect } from 'umi';
import styles from './index.less';
import RequestFormData from './RequestFormData';
import RequestFormUrlencoded from './RequestFormUrlencoded';
import RequestJson from './RequestJson';
import RequestXml from './RequestXml';
import RequestRaw from './RequestRaw';
import utils from '../../../../utils';

const RequestBody = (props) => {
    const {
        dispatch,
        scriptManagement: { stepTreeList, selectedNode }
    } = props;

    useEffect(() => {
        if (selectedNode?.request_args_type) {
            setCurType(selectedNode?.request_args_type);
        }
    }, [selectedNode])

    const [curType, setCurType] = useState('none');

    const handleChange = (e) => {
        updateTreeList([{ insertKey: 'request_args_type', insertValue: e.target.value }]);
        setCurType(e.target.value);
    };

    //. 更新树结构
    const updateTreeList = (insertList) => {
        let finalList = utils.recurseTreeList(stepTreeList, insertList, selectedNode);
        dispatch({
            type: 'scriptManagement/syncStepTreeList',
            stepTreeList: finalList
        })

        let currentNode = recurseFindTreeNode(finalList);
        dispatch({
            type: 'scriptManagement/syncSelectedNode',
            selectedNode: currentNode
        })
    };

    //. 遍历树结构
    const recurseFindTreeNode = (treeList) => {
        let targetRow = {};
        if (!treeList || treeList.length == 0) return {};

        for (const item of treeList) {
            if (item.id === selectedNode.id) return item;

            if (Array.isArray(item.childNode) && item.childNode.length > 0) {
                targetRow = recurseFindTreeNode(item.childNode);
                if (targetRow?.id) return targetRow;
            }
        }

        return targetRow;
    };

    return (
        <div>
            {selectedNode.nodeType == '2' ?
                <>
                    <div className={styles['request-body-scene']}>
                        <Radio.Group onChange={(e) => handleChange(e)} value={curType}>
                            <Radio value="none">none</Radio>
                            <Radio value="form-data">form-data</Radio>
                            <Radio value="x-www-form-urlencoded">x-www-form-urlencoded</Radio>
                            <Radio value="json">json</Radio>
                            <Radio value="raw">raw</Radio>
                        </Radio.Group>
                    </div>


                    <div className={styles['request-body-content']}>
                        {curType == 'none' && <div className={styles['request-body-content-none']} >当前请求没有请求体</div>}
                        {curType == 'form-data' && <RequestFormData />}
                        {curType == 'x-www-form-urlencoded' && <RequestFormUrlencoded />}
                        {curType == 'json' && <RequestJson />}
                        {curType == 'raw' && <RequestRaw />}
                    </div>
                </> : null
            }
            {selectedNode.nodeType == '4' ?
                <>
                    <div className={styles['request-body-scene']}>
                        <Radio.Group onChange={(e) => handleChange(e)} value={curType}>
                            <Radio value="xml">xml</Radio>
                            <Radio value="json">json</Radio>
                            <Radio value="raw">raw</Radio>
                        </Radio.Group>
                    </div>


                    <div className={styles['request-body-content']}>
                        {curType == 'xml' && <RequestXml />}
                        {curType == 'json' && <RequestJson />}
                        {curType == 'raw' && <RequestRaw />}
                    </div>
                </> : null
            }
        </div>
    )
}

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(RequestBody);