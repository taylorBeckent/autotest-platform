import React, { useState, useEffect } from 'react';
import { connect } from 'umi';
import { Collapse } from 'antd';
import { monaco } from '@monaco-editor/react';
import { ControlledEditor } from '@monaco-editor/react';
monaco.config({ paths: { vs: window.location.origin + '/min/vs' } });
import styles from './index.less';

const { Panel } = Collapse;

const StepResponseInfo = (props) => {
    const {
        dispatch,
        scriptManagement: { responseInfo, selectedNode }
    } = props;

    const [jsonData, setJsonData] = useState(); //. body

    // console.log('responseInfo脚本', responseInfo);

    useEffect(() => {
        if (responseInfo?.id === selectedNode.id) {
            //.body
            if (responseInfo.data && typeof (responseInfo.data) == 'object') {
                let headerStr = JSON.stringify(responseInfo.data, null, 2);
                setJsonData(headerStr);
            } else {
                setJsonData("");
            }
        }
    }, [responseInfo, selectedNode])

    const handleEditorChange = (value, e) => {
        setJsonData(e);
    };

    return (
        <div >
            <Collapse defaultActiveKey="Body">
                <Panel header="Body" key="Body">
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
                                readOnly: true,
                                scrollbar: {
                                    vertical: 'auto'
                                }
                            }}
                        />
                    </div>
                </Panel>
            </Collapse>
        </div>
    )
}

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(StepResponseInfo);
// export default StepResponseInfo;