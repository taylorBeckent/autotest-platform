import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'umi';
import { monaco } from '@monaco-editor/react';
import { debounce, cloneDeep } from 'lodash';
import { ControlledEditor } from '@monaco-editor/react';
monaco.config({ paths: { vs: window.location.origin + '/min/vs' } });
import styles from './index.less';
import EditorControlled from '@/pages/controller/components/EditorControlled';
// import TextArea from 'antd/lib/input/TextArea';
import formatXml from 'xml-formatter'
import { Select, Input, Button, Row, Col, message, Modal, Form, Popover } from 'antd';
const { TextArea } = Input
const RequestXml = (props) => {

    const {
        dispatch,
        // scriptManagement: { stepTreeList },
        interfaceManagement: { interfaceInfo }
    } = props;

    const [xmlData, setXmlData] = useState('');

    useEffect(() => {
        if (interfaceInfo?.request_text) {
            let initJsonData;
            if (typeof (interfaceInfo?.request_text) === 'object') {
                initJsonData = JSON.stringify(interfaceInfo?.request_text, null, 2);
            } else if (typeof (interfaceInfo?.request_text) === 'string') {
                initJsonData = interfaceInfo?.request_text
            }
            setXmlData(initJsonData);
            dispatch({
                type: 'interfaceManagement/syncXmlData',
                xmlData: initJsonData
            })
        } else {
            setXmlData();
        }
    }, []);
    const formatXmlContent = (xmlString) => {
        try {
            const formatted = formatXml(xmlString, {
                indentation: '       ', // 8 空格缩进
                collapseContent: true,
                lineSeparator: '\n',
                whiteSpaceAtEndOfSelfclosingTag: true,
                stripComments: false,
            });
            return formatted;
        } catch (error) {
            throw new Error(`XML 格式错误: ${error.message}`);
        }
    }

    // 执行格式化
    const handleFormat = () => {
        if (!xmlData || !xmlData.trim()) {
            // setError('⚠ 请输入 XML 内容');
            // setStatusMessage('');
            return;
        }

        // setIsFormatting(true);
        // setError('');

        try {
            let newStr = cloneDeep(xmlData)
            const formatted = formatXmlContent(newStr);
            console.log('formatted', formatted);
            // 标记为内部更新，避免触发 onBlur 重复格式化
            // isInternalUpdate.current = true;
            // setXmlContent(formatted);
            setXmlData(formatted)
            dispatch({
                type: 'interfaceManagement/syncXmlData',
                xmlData: formatted
            })

            // setStatusMessage('✅ 格式化成功');
            // setError('');

            // setTimeout(() => {
            //     // setStatusMessage('');
            //     // isInternalUpdate.current = false;
            // }, 2000);
        } catch (err) {
            message.error('格式化失败')
            // setError(`❌ ${err.message}`);
            // setStatusMessage('');
        }
        // finally {
        //     setIsFormatting(false);
        // }
    }
    const handleEditorChange = (e) => {
        setXmlData(e.target.value);
        dispatch({
            type: 'interfaceManagement/syncXmlData',
            xmlData: e.target.value
        })

    };
    // const handleEditorChange = (value, e) => {
    //     setXmlData(e.target.value);
    //     dispatch({
    //         type: 'interfaceManagement/syncXmlData',
    //         xmlData: e
    //     })

    // };

    return (
        <div className={styles['monacoEditor']}>
            {/* <ControlledEditor
                height="100%"
                width="100%"
                language="json"
                value={xmlData}
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
            {/* <EditorControlled height="100%" language="xml" value={xmlData} handleChange={handleEditorChange} fixedOverflowWidgets={false} /> */}
            <TextArea
                style={{ height: '495px', border: '0', outline: 'none', boxShadow: 'none' }}
                // language="xml"
                value={xmlData}
                onChange={(e) => handleEditorChange(e)}
                onKeyDown={(e) => {
                    if (e.shiftKey && e.altKey && (e.key == 'f' || e.key == 'F')) {
                        handleFormat()
                    }
                }}
            // fixedOverflowWidgets={false}
            />
        </div>
    )
}

export default connect(({ scriptManagement, interfaceManagement }) => ({
    scriptManagement,
    interfaceManagement
}))(RequestXml);