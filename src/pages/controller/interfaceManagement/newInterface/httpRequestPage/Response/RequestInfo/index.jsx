import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'umi';
import { Collapse } from 'antd';
import styles from '../ResponseInfo/index.less';
import formatXml from 'xml-formatter'
import { Select, Input, Button, Row, Col, message, Modal, Form, Popover } from 'antd';
const { TextArea } = Input
const { Panel } = Collapse;

const RequestInfo = (props) => {
    const {
        scriptManagement: { responseInfo },
        interfaceManagement: { titleProtocalType }
    } = props;

    const [bodyData, setBodyData] = useState();
    const [headerData, setHeaderData] = useState();

    useEffect(() => {
        //. body
        if (responseInfo?.request_info?.body && responseInfo?.request_info?.body_type == 'json') {
            let bodyStr = JSON.stringify(responseInfo?.request_info?.body, null, 2);
            setBodyData(bodyStr);
            if (responseInfo?.request_info?.headers) {
                let headerStr = JSON.stringify(responseInfo?.request_info?.headers, null, 2);
                setHeaderData(headerStr);
            } else {
                setHeaderData('null');
            }
        }else if (responseInfo?.request_info?.body && responseInfo?.request_info?.body_type == 'xml') {
            setBodyData(responseInfo?.request_info?.body)
        }
          
         else {
            setBodyData('null');
        }

        //. header
      
        if (responseInfo?.request_info?.body_type == 'xml') {
            handleFormat()
        }
    }, [responseInfo])

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
        if (!bodyData || !bodyData.trim()) {
            return;
        }
        try {
            // 不需要 cloneDeep，直接传字符串即可
            const formatted = formatXmlContent(bodyData);
            setBodyData(formatted);
        } catch (err) {
            // message.error(`格式化失败: ${err.message}`);
        }
    }
    useEffect(() => {
        handleFormat()
    }, [bodyData])
    return (
        <div >
            <Collapse defaultActiveKey="Body">
                <Panel header="Body" key="Body">
                    {/* <div className={styles['header']}> */}
                    <div className={styles['monacoEditor']}>
                        {/* {bodyData} */}
                        <TextArea
                            style={{ height: '100%', border: '0', outline: 'none', boxShadow: 'none' }}
                            value={bodyData}
                            readOnly
                        />
                    </div>
                </Panel>
                {titleProtocalType == 'HTTP' ? <Panel header="Header" key="Header">
                    <div className={styles['header']}>
                        {headerData}
                    </div>
                </Panel> : null}
            </Collapse>


        </div>
    )
}

export default connect(({ scriptManagement, interfaceManagement }) => ({
    scriptManagement,
    interfaceManagement
}))(RequestInfo);
// export default RequestInfo;