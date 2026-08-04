import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'umi';
import { Collapse } from 'antd';
import { monaco } from '@monaco-editor/react';
import { ControlledEditor } from '@monaco-editor/react';
monaco.config({ paths: { vs: window.location.origin + '/min/vs' } });
import styles from './index.less';
import formatXml from 'xml-formatter'
import { Select, Input, Button, Row, Col, message, Modal, Form, Popover } from 'antd';
const { TextArea } = Input

const { Panel } = Collapse;

const ResponseInfo = (props) => {
    const {
        dispatch,
        scriptManagement: { responseInfo, selectedNode }
    } = props;

    const [jsonData, setJsonData] = useState(); //. body
    const [xmlData, setXmlData] = useState(); //. body
    const [xmlType, setXmlType] = useState('1'); //. 1是TCP调试相应信息为json,2是string
    const [bodyData, setBodyData] = useState(); //. body
    const [headerData, setHeaderData] = useState(); //. header
    const [cookiesData, setCookiesData] = useState(); //. cookies

    useEffect(() => {
        if (responseInfo?.id === selectedNode.id) {
            //.body
            if (selectedNode.nodeType == '2' && responseInfo.data && typeof (responseInfo.data) == 'object') {
                let headerStr = JSON.stringify(responseInfo.data, null, 2);
                setJsonData(headerStr);
            } else if (selectedNode.nodeType == '4' && responseInfo.data && typeof (responseInfo.data) != 'object') {
                setXmlType('2')
                setXmlData(responseInfo.data)
               
            } else if (selectedNode.nodeType == '4' && responseInfo.data && typeof (responseInfo.data) == 'object') {
                setXmlType('1')
                let headerStr = JSON.stringify(responseInfo.data, null, 2);
                setJsonData(headerStr);
            }
            else {
                setJsonData("");
                setXmlData("");
            }

            //. header
            if (responseInfo?.headers) {
                let headerStr = JSON.stringify(responseInfo?.headers, null, 2);
                setHeaderData(headerStr);
            } else {
                setHeaderData('null');
            }

            //. cookies
            if (responseInfo?.cookies) {
                let cookiesStr = JSON.stringify(responseInfo?.cookies, null, 2);
                setCookiesData(cookiesStr);
            } else {
                setCookiesData('null')
            }
        }
        handleFormat()
    }, [responseInfo, selectedNode])
    useEffect(() => {
        handleFormat()
    }, [xmlData])
    const formatXmlContent = (xmlString) => {
        try {
            // ============ 预处理 ============
            let cleaned = xmlString;

            // 1. 移除外层引号（处理第二种格式）
            cleaned = cleaned.replace(/^"|"$/g, '');

            // 2. 处理转义字符：将 \r\n 和 \n 统一转为换行符
            cleaned = cleaned.replace(/\\r\\n/g, '\n');
            cleaned = cleaned.replace(/\\r/g, '\n');
            cleaned = cleaned.replace(/\\t/g, '  '); // \t 转为两个空格

            // 3. 临时保护变量占位符（${...}），避免被格式化破坏
            const placeholderMap = {};
            let counter = 0;
            cleaned = cleaned.replace(/\$\{[^}]+\}/g, (match) => {
                const key = `___PH_${counter++}___`;
                placeholderMap[key] = match;
                return key;
            });

            // ============ 格式化 ============
            const formatted = formatXml(cleaned, {
                indentation: '       ', // 7 个空格（或改成你想要的）
                collapseContent: true,
                lineSeparator: '\n',
                whiteSpaceAtEndOfSelfclosingTag: true,
                stripComments: false,
            });

            // ============ 后处理 ============
            // 4. 恢复变量占位符
            let result = formatted;
            Object.keys(placeholderMap).forEach((key) => {
                result = result.replace(new RegExp(key, 'g'), placeholderMap[key]);
            });

            return result;

        } catch (error) {
            throw new Error(`XML 格式错误: ${error.message}`);
        }
    }

    // 执行格式化
    const handleFormat = () => {
        if (!xmlData) {
            return;
        }
        try {
            // 不需要 cloneDeep，直接传字符串即可
            const formatted = formatXmlContent(xmlData);
            setBodyData(formatted);
        } catch (err) {
            // message.error(`格式化失败: ${err.message}`);
        }
    }
    const handleEditorChange = (value, e) => {
        setJsonData(e);
    };
    const handleXmlChange = (e) => {
        // setXmlData(e.target.value);
        setBodyData(e.target.value);
    };
    return (
        <div >
            <Collapse defaultActiveKey="Body">
                <Panel header="Body" key="Body">
                    <div className={styles['monacoEditor']}>
                        {selectedNode.nodeType == '2' || xmlType == '1' ? <ControlledEditor
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
                        /> : null}
                        {selectedNode.nodeType == '4' && xmlType == '2' ? <TextArea
                            style={{ height: '100%', border: '0', outline: 'none', boxShadow: 'none' }}
                            // language="xml"
                            value={bodyData}
                            onChange={(e) => handleXmlChange(e)}
                            onKeyDown={(e) => {
                                if (e.shiftKey && e.altKey && (e.key == 'f' || e.key == 'F')) {
                                    handleFormat()
                                }
                            }}
                        // fixedOverflowWidgets={false}
                        /> : null}
                    </div>
                </Panel>
                {selectedNode.nodeType == '2' ?
                    <Panel header="Header" key="Header">
                        <div className={styles.header}>
                            {headerData}
                        </div>
                    </Panel> : null
                }
                {selectedNode.nodeType == '2' ? <Panel header="Cookies" key="Cookies">
                    <div className={styles['cookies']}>
                        {cookiesData}
                    </div>
                </Panel> : null}
            </Collapse>


        </div>
    )
}

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(ResponseInfo);
// export default ResponseInfo;