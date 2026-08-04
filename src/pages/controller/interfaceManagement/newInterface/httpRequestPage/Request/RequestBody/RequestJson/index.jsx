import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'umi';
import { monaco } from '@monaco-editor/react';
import { debounce } from 'lodash';
import { ControlledEditor } from '@monaco-editor/react';
monaco.config({ paths: { vs: window.location.origin + '/min/vs' } });
import styles from './index.less';
import EditorControlled from '@/pages/controller/components/EditorControlled';

const RequestJson = (props) => {

    const {
        dispatch,
        // scriptManagement: { stepTreeList },
        interfaceManagement: { interfaceInfo }
    } = props;

    const [jsonData, setJsonData] = useState();

    useEffect(() => {
        if (interfaceInfo?.request_body) {
            let initJsonData;

            if (typeof (interfaceInfo?.request_body) === 'object') {
                initJsonData = JSON.stringify(interfaceInfo?.request_body, null, 2);
            } else if (typeof (interfaceInfo?.request_body) === 'string') {
                initJsonData = interfaceInfo?.request_body
            }

            setJsonData(initJsonData);
            dispatch({
                type: 'interfaceManagement/syncJsonData',
                jsonData: initJsonData
            })
        } else {
            setJsonData();
        }
    }, []);

    const handleEditorChange = (value, e) => {
        console.log('setJsonDatae--', e);
        setJsonData(e);

        dispatch({
            type: 'interfaceManagement/syncJsonData',
            jsonData: e
        })

    };

    return (
        <div className={styles['monacoEditor']}>
            {/* <ControlledEditor
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
                    }
                }}
            /> */}
            <EditorControlled height="100%" language="json" value={jsonData} handleChange={handleEditorChange} fixedOverflowWidgets={false} />
        </div>
    )
}

export default connect(({ scriptManagement, interfaceManagement }) => ({
    scriptManagement,
    interfaceManagement
}))(RequestJson);