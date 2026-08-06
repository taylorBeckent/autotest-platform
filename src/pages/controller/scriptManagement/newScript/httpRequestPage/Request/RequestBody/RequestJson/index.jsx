import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'umi';
import { monaco } from '@monaco-editor/react';
import { debounce } from 'lodash';
import utils from '../../../../../utils';
import { ControlledEditor } from '@monaco-editor/react';
monaco.config({ paths: { vs: window.location.origin + '/min/vs' } });
import styles from './index.less';

const RequestJson = (props) => {

    const {
        dispatch,
        scriptManagement: { stepTreeList, selectedNode, currentNodeInfo }
    } = props;

    const [jsonData, setJsonData] = useState();

    useEffect(() => {
        if (selectedNode?.request_body) {
            let initJsonData;

            if (typeof (selectedNode?.request_body) === 'object') {
                initJsonData = JSON.stringify(selectedNode?.request_body, null, 2);
            } else if (typeof (selectedNode?.request_body) === 'string') {
                initJsonData = selectedNode?.request_body
            }

            // console.log('json数据初始化',initJsonData);

            setJsonData(initJsonData);
            // dispatch({
            //     type: 'scriptManagement/syncJsonData',
            //     jsonData: initJsonData
            // })
        } else {
            setJsonData();
        }
    }, [selectedNode]);

    const handleEditorChange = (value, e) => {
        setJsonData(e);

            dispatch({
                type: 'scriptManagement/syncJsonData',
                jsonData: e
            })

            // delayUpdateTreeList(e);
            updateTreeList([{ insertKey: 'request_body', insertValue: e }]);
    };

    // const delayUpdateTreeList = debounce(updateTreeList([{ insertKey: 'request_body', insertValue: e }]), 2000);

    const updateTreeList = (insertList) => {
        let finalList = utils.recurseTreeList(stepTreeList, insertList, selectedNode);
        dispatch({
            type: 'scriptManagement/syncStepTreeList',
            stepTreeList: finalList
        })
    }

    return (
        <div className={styles['monacoEditor']}>
            <ControlledEditor
                height="100%"
                width="100%"
                language="json"
                value={jsonData}
                onChange={handleEditorChange}
                theme="vs"
                options={{
                    fontSize: 12,
                    minimap: { enabled: false },
                    suggestFontSize: 7,
                    suggestLineHeight: 33,
                    fixedOverflowWidgets: false,
                    scrollBeyondLastLine: false,
                    scrollbar: {
                        vertical: 'auto'
                    },
                    readOnly: selectedNode?.isQuote
                }}
            />
        </div>
    )
}

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(RequestJson);
// export default RequestJson;