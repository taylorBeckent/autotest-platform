import React, { useEffect, useState } from 'react';
import { Button, Tag, Space, Row, Col } from 'antd';
import styles from './index.less';
import { parseStepType, parseStepEnv } from '@/pages/controller/scriptManagement/component/utils.js';

const StepItem = ({ stepDatas, onSelectRow, onTransferStatus, rightDisplay }) => {
    const [activeIndex, setActiveIndex] = useState("");
    const [itemDisplayEnv, setItemDisplayEnv] = useState(false);

    useEffect(() => {
        if (rightDisplay) {
            setItemDisplayEnv(true);
        }
    }, [rightDisplay]);

    // step_exec_logger  
    function parseStepState(stepItem) {
        switch (stepItem?.step_state) {
            case true:
                return { tag: '成功', color: 'green' };
            case false:
                return { tag: '失败', color: 'volcano' };
            case '2':
                return { tag: '进行中', color: 'yellow' };
            case '3':
                return { tag: '中止', color: 'blue' };
            default:
                return { tag: '未知', color: 'black' };
        }
    }
    function parseReqStatus(stepItem) {
        const stepType = parseStepType(stepItem);
        if (stepType == 2 || stepType == 4) {
            const stepExecLogger = stepItem.step_exec_logger ?? '';
            const statusMatch = stepExecLogger?.match(/响应代码:\s+(\d+),/);
            const status = statusMatch ? statusMatch[1] : '';
            // const methodMatch = stepExecLogger?.match(/请求方式:\s+(\w+)\s/);
            // const method = methodMatch ? methodMatch[1] : '';
            // const regex = /请求地址:\s*(?:http|https):\/\/[^\/]+([^?\s#]*)/;
            const regex = /[http|https]:\/\/[^\/]+([^?\s#]*)/;
            // 分解：  
            // - 请求地址:\s* → 匹配前缀（含可变空格）；  
            // - (?:http|https):// → 匹配协议（非捕获组）；  
            // - [^\/]+ → 匹配域名/端口（无斜杠）；  
            // - ([^?#]*) → 捕获组1（路径：除?/#外的所有字符）。 
            // const urlMatch = stepExecLogger.match(regex);
            const urlMatch = stepItem.request_url?.match(regex);

            const url = urlMatch ? urlMatch[1] : '';
            const elapsed = stepItem.response_elapsed > 1 ? `${stepItem.response_elapsed}s` : `${stepItem.response_elapsed * 1000}ms`;
            return { status: status.trim(), method: stepItem.request_method, url: url.trim(), elapsed: elapsed, stepType: stepItem.step_type };
        }
        return { status: stepItem?.step_state ? '200' : '400', method: null, url: null, elapsed: `${stepItem.step_elapsed * 1000}ms`, stepType: stepItem.step_type };
    }

    function methodColor(method) {
        if (!method) return;
        switch (method.toUpperCase()) {
            case 'POST':
                return 'green';
            case 'GET':
                return 'dodgerblue';
            case 'PUT':
                return 'cornflowerblue';
            case 'DELETE':
                return 'red';
            case 'OPTION':
                return 'burlywood';
            default:
                return 'green';
        }
    }

    return (
        <ul>
            {stepDatas?.map((item) => {
                const tagContent = parseStepState(item);
                const reqStatus = parseReqStatus(item);
                const curStepType = parseStepType(item);        // 步骤类型
                const curStepEnv = parseStepEnv(item, curStepType); // 当前步骤的执行环境
                return <li
                    key={item.step_code}
                    style={{ marginBottom: 6, borderRadius: 4, backgroundColor: item.step_code === activeIndex ? '#e3e5e9' : '' }}
                    className={styles.liBg}
                    onClick={() => setActiveIndex(item.step_code)}
                >
                    <Button
                        type='text'
                        style={{
                            width: '100%',
                            height: '56',
                            fontSize: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0 12px',
                            borderRadius: 8,
                            // borderBottom: '1px solid gray'
                        }}
                        onClick={() => { onSelectRow(item); onTransferStatus(reqStatus); setItemDisplayEnv(true); }}
                    >
                        <Row style={{ width: '100%' }}>
                            <Col span={17} flex='auto' style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <Space size={8} align="center">
                                    <Tag color={tagContent.color}>{tagContent.tag}</Tag>
                                    <span>{item.step_name} </span>
                                    {curStepType == 2 && <>
                                        <span style={{ color: methodColor(reqStatus.method), fontSize: 12 }}>{reqStatus.method} </span>
                                        {!rightDisplay && <span style={{ fontSize: 12 }}>{reqStatus.url} </span>}</>}
                                </Space>
                            </Col>
                            <Col span={7} flex='auto' style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <Space size={6} style={{ fontSize: 13, color: '#999' }}>
                                    <span style={{ color: reqStatus.status === '200' ? 'green' : 'red' }}>{reqStatus.status} </span>
                                    <span>{`${item.step_elapsed}s`}</span>
                                </Space>
                                {curStepEnv != null && <Space size={2} style={{ fontSize: 13, color: '#999', marginLeft: 4 }}>
                                    <span style={{ fontSize: 8 }}>{curStepEnv}</span>
                                </Space>}
                                {[2, 4, 5].includes(curStepType) && !itemDisplayEnv && <Space size={8} style={{ fontSize: 13, color: '#999', marginLeft: 4 }}>
                                    <span> 配置: </span>
                                    <span style={{ fontSize: 8 }}>{item?.request_config_name}</span>
                                    {curStepType == 5 && <><span> 数据库: </span>
                                        <span style={{ fontSize: 8 }}>{item?.response_body != null ? item?.response_body[0].database_name : ''}</span></>}
                                </Space>}
                            </Col>
                        </Row>
                    </Button>
                </li>
            })}
        </ul>
    );
};

export default StepItem;