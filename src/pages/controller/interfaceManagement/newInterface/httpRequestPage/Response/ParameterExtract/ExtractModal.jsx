import React, { useState, useEffect } from 'react';
import { Button, Modal, message } from 'antd';
import formatXml from 'xml-formatter';
import { monaco } from '@monaco-editor/react';
import { ControlledEditor } from '@monaco-editor/react';
monaco.config({ paths: { vs: window.location.origin + '/min/vs' } });
import styles from './index.less';

const ExtractModal = (props) => {
    const {
        status,
        currentData,
        onCancel,
    } = props;

    const [value, setValue] = useState();
    const [messageType, setMessageType] = useState('text');

    useEffect(() => {
        if (!currentData) return;
        if (typeof currentData === 'object') {
            setMessageType('json');
            setValue(JSON.stringify(currentData, null, 2));
        } else {
            setMessageType('string');
            if (isXMLStr(currentData)) {
                setValue(formatXmlContent(currentData));
                return;
            }

            if (isValidJsonStr(currentData)) {
                setValue(JSON.stringify(JSON.parse(currentData), null, 2));
                return;
            }
            setValue(currentData);
        }
    }, [])

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
    };

    //. xml格式校验
    const isXMLStr = (str) => {
        if (typeof str !== 'string' || !str.trim()) return false;
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(str, 'text/xml');

            const errors = doc.getElementsByTagName("parsererror");
            if (errors.length > 0) return false;

            return doc.children.length > 0 && doc.children[0].nodeType === 1;
        } catch (e) {
            return false;
        }
    };

    const isValidJsonStr = (str) => {
        if (typeof str !== 'string' || !str.trim()) return false;
        try {
            JSON.parse(str);
            return true;
        } catch (error) {
            return false
        }
    };

    //.服务器复制
    const handleCopy = (copyVal) => {
        const textArea = document.createElement("textarea");
        textArea.value = copyVal || '';
        textArea.style.position = 'absolute';
        textArea.style.opacity = '0';
        textArea.style.left = '-999999px';
        // textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        if (!document.execCommand('copy')) {
            throw new Error('Copy command failed');
        }
        textArea.remove();
    };

    return (
        <Modal
            title="报文信息"
            visible={status != 'closed'}
            width={800}
            height={800}
            maskClosable={false}
            onCancel={onCancel}
            footer={[
                <Button type="primary" onClick={() => { handleCopy(value); message.success('已复制到剪切板'); }} >一键复制</Button>
            ]}
        >
            <div className={styles['monacoEditor']}>
                <ControlledEditor
                    height="100%"
                    width="100%"
                    language={messageType}
                    value={value}
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
        </Modal>
    )
}


export default ExtractModal;
