import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'umi';
import { monaco } from '@monaco-editor/react';
import { ControlledEditor } from '@monaco-editor/react';
monaco.config({ paths: { vs: window.location.origin + '/min/vs' } });
import styles from '../RequestJson/index.less';

const RequestRaw = () => {

    const [jsonData, setJsonData] = useState();

    const handleEditorChange = (value, e) => {
        setJsonData(e);
    };

    return (
        <div className={styles['monacoEditor']}>
            <ControlledEditor
                height="100%"
                width="100%"
                language="text"
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
            />
        </div>
    )
}

export default RequestRaw;