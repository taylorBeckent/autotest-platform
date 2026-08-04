import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Card, Form, Input, message, Button, Tag, Empty, Space, Select, Tooltip, Row, Col, Statistic } from 'antd';
import styles from './index.less';
import { SwapOutlined, ClearOutlined, CopyOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import formatXml from 'xml-formatter';
import { monaco } from '@monaco-editor/react';
import { DiffEditor } from '@monaco-editor/react';
monaco.config({ paths: { vs: window.location.origin + '/min/vs' } });
import downDiffReport from './downDiffReport';

const DiffPatch = forwardRef((props, ref) => {
    const {
        currentData,
    } = props;

    const [originVal, setOriginVal] = useState();
    const [modifyVal, setModifyVal] = useState();
    const [originType, setOriginType] = useState('string');
    const [modifyType, setModifyType] = useState('string');
    const diffEditorRef = useRef(null);

    useEffect(() => {
        validData(currentData.left_text, 'origin');
        validData(currentData.right_text, 'modify');
    }, []);

    const handleEditorMount = (getEditorValue, editor) => {
        diffEditorRef.current = editor;
    };

    useImperativeHandle(ref, () => ({
        exportDiffReport: () => {
            if (!diffEditorRef.current) {
                message.warn('编辑器尚未加载');
                return;
            }
            downDiffReport(originVal, modifyVal);
        }
    }));

    /**
     * @targetStr   数据
     * @scene       数据来源
    */
    const validData = (targetStr, scene) => {
        if (isXMLStr(targetStr)) {
            if (scene == 'origin') {
                setOriginVal(formatXmlContent(targetStr));
            } else {
                if (isXMLStr(currentData.left_text) && currentData.order_control == 0) {
                    let sortOrderXMLModify = recordXMLToMatch(targetStr, currentData.left_text);

                    setModifyVal(formatXmlContent(sortOrderXMLModify));
                    return;
                }
                setModifyVal(formatXmlContent(targetStr));
            }
            return;
        }

        if (isValidJsonStr(targetStr)) {
            if (scene == 'origin') {
                setOriginVal(JSON.stringify(JSON.parse(targetStr), null, 2))
            } else {
                //. 忽略顺序 且 左侧数据同为json
                if (isValidJsonStr(currentData.left_text) && currentData.order_control == 0) {
                    let sortOrderModify = reorderKeysToMatch(JSON.parse(targetStr), JSON.parse(currentData.left_text));

                    setModifyVal(JSON.stringify(sortOrderModify, null, 2));
                    return;
                }
                setModifyVal(JSON.stringify(JSON.parse(targetStr), null, 2));
            }
            return;
        }

        scene == 'origin' ? setOriginVal(targetStr) : setModifyVal(targetStr);
    };

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
            const parsed = JSON.parse(str);
            return parsed !== null && typeof parsed === 'object';
        } catch (error) {
            return false
        }
    };

    //. 将 source 对象的键顺序重排为 与 template 一致， 忽略排序模式下使用
    const reorderKeysToMatch = (source, template) => {
        if (source === null || template === null) return source;
        if (typeof source !== 'object') return source;

        if (Array.isArray(source)) {
            if (Array.isArray(template)) {
                return source.map((item, index) => {
                    const tpl = index < template.length ? template[index] : template[0];
                    if (tpl !== undefined && (typeof tpl === 'object' && tpl !== null)) {
                        return reorderKeysToMatch(item, tpl);
                    }
                    return item;
                });
            } else {
                if (typeof template === 'object' && template !== null && !Array.isArray(template)) {
                    return source.map(item => reorderKeysToMatch(item, template));
                }
                return source;
            }
        }

        if (typeof template !== 'object' || template === null || Array.isArray(template)) {
            return source;
        }

        const result = {};
        for (const key of Object.keys(template)) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                result[key] = reorderKeysToMatch(source[key], template[key]);
            }
        }
        for (const key of Object.keys(source)) {
            if (!Object.prototype.hasOwnProperty.call(result, key)) {
                result[key] = source[key];
            }
        }
        return result;
    };

    const extractXmlDecl = (str) => {
        // 1. 移除 BOM（如果存在）
        str = str.replace(/^\uFEFF/, '');

        // 2. 找到第一个非空白字符的位置，判断是否是 '<'
        const trimmedStr = str.trimStart();
        if (!trimmedStr.startsWith('<?xml')) {
            return ''; // 没有声明
        }

        // 3. 找到第一个 '?>' 的位置（声明结束）
        const endIndex = trimmedStr.indexOf('?>');
        if (endIndex === -1) {
            return ''; // 声明不完整
        }

        // 4. 提取从开头到 '?>' 的完整声明
        return trimmedStr.substring(0, endIndex + 2);
    }

    //. 将 source XML 的元素顺序重排为 与 template 一致， 忽略排序模式下使用
    const recordXMLToMatch = (sourceStr, templateStr) => {
        try {
            const xmlDecl = extractXmlDecl(sourceStr);

            const parser = new DOMParser();
            const sourceDoc = parser.parseFromString(sourceStr, 'text/xml');
            const templateDoc = parser.parseFromString(templateStr, 'text/xml');
            if (sourceDoc.querySelector('parsererror') || templateDoc.querySelector('parsererror')) return sourceStr;

            const reorderChildren = (sourceNode, templateNode) => {
                if (sourceNode.nodeType !== 1 || templateNode.nodeType !== 1) return;
                const templateElems = Array.from(templateNode.childNodes).filter(c => { return c.nodeType === 1 });
                const sourceElems = Array.from(sourceNode.childNodes).filter(c => { return c.nodeType === 1 });
                if (templateElems.length === 0 || sourceElems.length === 0) return;

                //. 按 template 的顺序重排 source 的同名子元素
                let usedIndices = {};
                let reordered = [];
                for (let t = 0; t < templateElems.length; t++) {
                    let tTag = templateElems[t].tagName;
                    for (let s = 0; s < sourceElems.length; s++) {
                        if (sourceElems[s].tagName === tTag && !usedIndices[s]) {
                            reordered.push(sourceElems[s]);
                            usedIndices[s] = true;
                            break;
                        }
                    }
                }

                // 追加 template 中没有的剩余元素
                for (let s = 0; s < sourceElems.length; s++) {
                    if (!usedIndices[s]) reordered.push(sourceElems[s]);
                }

                //. 移除所有元素子节点，按新顺序追加
                sourceElems.forEach(el => el.parentNode.removeChild(el));
                reordered.forEach(el => sourceNode.appendChild(el));

                //. 递归处理各级子元素
                for (let t = 0; t < templateElems.length; t++) {
                    let templateChild = templateElems[t];
                    let tag = templateChild.tagName;
                    let sourceChildren = Array.from(sourceNode.childNodes).filter(c => { return c.nodeType === 1 });
                    for (let s2 = 0; s2 < sourceChildren.length; s2++) {
                        if (sourceChildren[s2].tagName === tag) {
                            reorderChildren(sourceChildren[s2], templateChild);
                            break;
                        }
                    }
                }
            }

            reorderChildren(sourceDoc.documentElement, templateDoc.documentElement);
            const formatted = formatXmlWritten(sourceDoc.documentElement, '', true);

            return xmlDecl ? xmlDecl + '\n' + formatted : formatted;
            // return formatXmlContent(sourceDoc.documentElement);
        } catch (e) {
            console.log(e);
            return sourceStr;
        }
    };

    //. 将 xml 格式反编译到字符串
    const formatXmlWritten = (node, indent, sortAttrs) => {
        const nextIndent = indent + '  ';

        if (node.nodeType === 3) {
            const text = (node.textContent || '').trim();
            return text ? indent + text + '\n' : '';
        }

        let result = indent + '<' + node.tagName;

        const attrs = Array.from(node.attributes);
        const sortedAttrs = sortAttrs
            ? attrs.sort((a, b) => a.name.localeCompare(b.name))
            : attrs;
        sortedAttrs.forEach(attr => {
            result += ' ' + attr.name + '="' + attr.textContent + '"';
        })

        const children = Array.from(node.childNodes);
        const hasChildren = children.some(c => c.nodeType === 1 || ((c.textContent || '').trim()));

        if (!hasChildren) {
            result += ' />\n';
        } else {
            result += '>\n';
            children.forEach(child => {
                result += formatXmlWritten(child, nextIndent, sortAttrs);
            })
            result += indent + '</' + node.tagName + '>\n';
        }

        return result;
    };

    return (
        <div className="react-differ">
            <div className={styles['monacoEditor']}>
                <DiffEditor
                    height="100%"
                    width="100%"
                    original={originVal}
                    originalLanguage={originType}
                    modified={modifyVal}
                    modifiedLanguage={modifyType}
                    editorDidMount={handleEditorMount}
                    theme="vs"
                    options={{
                        fontSize: 12,
                        minimap: { enabled: false },
                        suggestFontSize: 7,
                        suggestLineHeight: 33,
                        readOnly: true,
                        wordWrap: 'on',
                        scrollbar: {
                            vertical: 'auto'
                        }
                    }}
                />
            </div>
        </div>
    )
});

export default DiffPatch;