
import React from 'react';
import { monaco } from '@monaco-editor/react';
import { ControlledEditor } from '@monaco-editor/react';
monaco.config({ paths: { vs: window.location.origin + '/min/vs' } });

const EditorControlled = (props) => {
    const { 
        language = 'python',
        value,
        handleChange,
        readOnly = false ,
        fixedOverflowWidgets = true ,
        scrollBeyondLastLine = false ,
        automaticLayout = true,
        height = '40vh',
        width = '100%',
        fontSize = 12,
        theme = 'vs'
    } = props;
    
    return (
        <ControlledEditor
            height={height}
            width={width}
            language={language}
            value={value}
            onChange={handleChange}
            theme={theme}
            options={{
                fontSize: fontSize,
                minimap: { enabled: false },
                suggestFontSize: 7,
                suggestLineHeight: 33,
                fixedOverflowWidgets: fixedOverflowWidgets,
                scrollBeyondLastLine: scrollBeyondLastLine,
                automaticLayout: automaticLayout,
                readOnly: readOnly,
                scrollbar: {
                    vertical: 'auto'
                }
            }}
        />
    )
}

export default EditorControlled;