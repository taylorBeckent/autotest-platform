import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'umi';
import { monaco } from '@monaco-editor/react';
import { debounce, cloneDeep } from 'lodash';
import utils from '../../../../../utils';
import { ControlledEditor } from '@monaco-editor/react';
monaco.config({ paths: { vs: window.location.origin + '/min/vs' } });
import styles from './index.less';
import formatXml from 'xml-formatter'
import { Select, Input, Button, Row, Col, message, Modal, Form, Popover } from 'antd';
const { TextArea } = Input

const RequestXml = (props) => {

    const {
        dispatch,
        scriptManagement: { stepTreeList, selectedNode, currentNodeInfo }
    } = props;

    const [xmlData, setXMLData] = useState();

    useEffect(() => {
        if (selectedNode?.request_text) {
            let initJsonData;

            if (typeof (selectedNode?.request_text) === 'object') {
                initJsonData = JSON.stringify(selectedNode?.request_text, null, 2);
            } else if (typeof (selectedNode?.request_text) === 'string') {
                initJsonData = selectedNode?.request_text
            }

            // console.log('json数据初始化',initJsonData);

            setXMLData(initJsonData);
            // dispatch({
            //     type: 'scriptManagement/syncJsonData',
            //     xmlData: initJsonData
            // })
        } else {
            setXMLData();
        }
        if (selectedNode?.request_body) {
            let initJsonData;

            if (typeof (selectedNode?.request_body) === 'object') {
                initJsonData = JSON.stringify(selectedNode?.request_body, null, 2);
            } else if (typeof (selectedNode?.request_body) === 'string') {
                initJsonData = selectedNode?.request_body
            }
        }
    }, [selectedNode]);


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
            return;
        }



        try {
            let newStr = cloneDeep(xmlData)
            const formatted = formatXmlContent(newStr);
            setXMLData(formatted)

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
        setXMLData(e.target.value);
        dispatch({
            type: 'interfaceManagement/syncXmlData',
            xmlData: e.target.value
        })
        updateTreeList([{ insertKey: 'request_text', insertValue: e.target.value}]);

    };

    // const handleEditorChange = (value, e) => {
    //     setXMLData(e);

    //     dispatch({
    //         type: 'scriptManagement/syncXmlData',
    //         xmlData: e
    //     })

    //     // delayUpdateTreeList(e);
    //     updateTreeList([{ insertKey: 'request_text', insertValue: e }]);
    // };

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
                    },
                    readOnly: selectedNode?.isQuote
                }}
            /> */}
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

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(RequestXml);
// export default RequestJson;