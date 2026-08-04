import React, { useEffect, useState } from 'react';
import { Card, Tabs, Input,  Row, Col, Typography, message, Table } from "antd";
import JsonViewer from './JsonViewer';
import { formatXmlContent, parseDatabaseEnvInfo, safeParse } from './utils';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import EditorControlled from '@/pages/controller/components/EditorControlled';
import { parseStepType, parseStepEnv, parseStepReqUrl } from '@/pages/controller/scriptManagement/component/utils.js';

const { Paragraph } = Typography;

const { TextArea } = Input;

const isObjectAndArray = (v) => {
    return !Array.isArray(v) && typeof v !== 'object';
}

const VarList = ({vars, title}) => {
    const columns = [
        {
            title: 'key',
            key: 'key',
            dataIndex: 'key',
            width: '30%'
        },
        {
            title: '值',
            key: 'value',
            dataIndex: 'value',
            width: '50%',
            render: (value) => {
                if (isObjectAndArray(value)) return value;
                return (
                    <span>
                        {JSON.stringify(value, null, 2)}
                    </span>
                );
            }
        },
        {
            title: '描述',
            key: 'desc',
            dataIndex: 'desc',
            width: '20%'
        }
    ];

    return (
        <Card size='small' title={title}  style={{ border: '1px dashed #6193d8', marginBottom: 6, borderRadius: 8 }}>
            <Table
                scroll={{x: '100%'}}
                size='small'
                showHeader={false}
                key={title}
                columns={columns}
                dataSource={vars}
                pagination={false}
            />
        </Card>
    )
};

function parseKey(data, keyPrefix) {
    if (data === null || data === undefined || data.size === 0) return new Map();
    return new Map(
        Object.entries(data).map(([key, value]) => [ key.startsWith(keyPrefix) ? key.slice(keyPrefix.length) : key, value])
    )
}

const Wrapper = ({children}) => {
    return (
        <div
            style={{ 
                width: '100%',
                padding: '6px 12px',
                backgroundColor: '#fafafa',
                borderRadius: 10,
                marginBottom: 6
                }}>
            {children}       
        </div>
    )
}

const AssertStatus = ({assert}) => {
    if (assert === null || assert.length === 0) return '';
    const [openIndex, setOpenIndex] = useState(null);

    function toogel(index) {
        setOpenIndex(openIndex === index ? null : index);
    }

    useEffect(() => {
        setOpenIndex(null);
    }, [assert]);
    
    const labelStyle = {
        fontSize: 12,
        color: '#666',
        marginRight: 4
    };
    return (
        <ul>
            {assert.map((item, index)=> (
            <li key={index}>
                <Row align="middle" gutter={8} style={{ width: '100%', minHeight: 32, cursor: 'pointer' }} onClick={() => toogel(index)}>
                    <Col flex="none">
                        {item.success ? <CheckCircleFilled style={{ color: '#b7eb8f' }} /> : <CloseCircleFilled style={{ color: '#f55a49' }} />}
                    </Col>
                    <Col flex="none" style={labelStyle}>实际值: </Col>
                    <Col flex="auto">
                        <TextArea autoSize={{ minRows: 1, maxRows: 6 }} bordered={false} value={item.actual_value} readOnly />
                    </Col>
                    <Col span={4}>
                        <Input bordered={false} value={item.operation} readOnly />
                    </Col>
                    <Col flex="none" style={labelStyle}>预期值: </Col>
                    <Col flex="auto">
                        <TextArea autoSize={{ minRows: 1, maxRows: 6 }} bordered={false} value={item.except_value} readOnly />
                    </Col>
                </Row>
                {openIndex === index && <Row align={"middle"} gutter={8} style={{ padding: 12, background: '#f5f5f5', marginLeft: 2 }}>
                    <Col span={24}>
                        <Row gutter={6}>
                            <Col span={3}>断言表达式:</Col>
                            <Col span={18}>
                            <TextArea autoSize={{ minRows: 1, maxRows: 6 }}  bordered={false} value={item.expr} readOnly />
                            </Col>
                        </Row>
                        {!item.success &&
                        <Row gutter={6}>
                            <Col span={3}>错误信息:</Col>
                            <Col span={18}>
                                <TextArea autoSize={{ minRows: 1, maxRows: 6 }} bordered={false} value={item.error} readOnly />
                            </Col></Row>}
                    </Col>
                    </Row>}
            </li>
            ))}
        </ul>
    )
}

const DisplayEnv = ({envInfoArr, stepType}) => {
    return (
    <>
    {[2,4,5].includes(stepType) && <Wrapper>
        {envInfoArr?.map(envInfo => (<Row>
            <Col span={stepType != 5 ? 9 : 7} flex='auto' style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <span style={{ marginLeft: 4, marginRight: 6}}>配置:</span>
                <span>{envInfo.config_name}</span>
            </Col>
            {stepType == 5 && <Col span={6} flex='auto' style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <span style={{ marginLeft: 4, marginRight: 6}}>数据库:</span>
                <span>{envInfo.database_name}</span>
            </Col>}
            <Col span={stepType != 5 ? 7 : 6} flex='auto' style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <span style={{ marginLeft: 4, marginRight: 6}}>IP:</span>
                <span>{envInfo.ip}</span>
            </Col>
            <Col span={stepType != 5 ? 7 : 5} flex='auto' style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <span style={{ marginLeft: 4, marginRight: 6}}>端口:</span>
                <span>{envInfo.port}</span>
            </Col>
        </Row>))}
    </Wrapper>}
    </>
    );
};

const ReportDetailRight = (props) => {
    const { selectedRecord, transferStatus, closeReportDetail } = props;
    const { TabPane } = Tabs;
    const [activeTabs, setActiveTabs] = useState('hisRequest');
    const [stepType, setStepType] = useState();
    const [envInfo, setEnvInfo] = useState([]);

    useEffect(() => {
        const curStepType = parseStepType(selectedRecord);
        const curEnv = parseStepEnv(selectedRecord, curStepType);
        setStepType(curStepType);
        if ([2].includes(curStepType)) {
            const reqInfo = parseStepReqUrl(selectedRecord.request_url);
            setEnvInfo([{request_url: reqInfo.url, env: curEnv, ip: reqInfo.ip, port: reqInfo.port, config_name: selectedRecord.request_config_name}]);
        }
        if (curStepType == 5) {
            const curDatabaseEnv = parseDatabaseEnvInfo(selectedRecord);
            const dataEnv = Object.values(curDatabaseEnv)?.map(v => ({env: v.env, ip: v.ip, port: v.port, config_name: v.config_name, database_name: v.database_name}));
            setEnvInfo(dataEnv);
        }
        if (curStepType == 4) {
            setEnvInfo([{request_url: `${selectedRecord.request_url}:${selectedRecord.request_port}`, env: curEnv, ip: selectedRecord.request_url, port: selectedRecord.request_port, config_name: selectedRecord.request_config_name}])
        }
    }, [selectedRecord]);
    
    function parseDataSource(data) {
        if (data === null) {
            return {type: 'json', req: ''};
        }
        const tmp = safeParse(data);
        const bodyprefix = "$.Body.";
        const headprefix = "$.Head.";
        const prefix = "$.";
        if (tmp === null) return '';
        const tmpData = 'dataset' in tmp ?  tmp.dataset : tmp;
        const assertBody =  tmpData.assert_body;
        const assertHead = tmpData.assert_head;
        const { body , head } = tmpData;
        const pBody = parseKey(safeParse(body), bodyprefix);
        const pHead = parseKey(safeParse(head), headprefix);
        const pAssertBody = parseKey(safeParse(assertBody), prefix);
        const pAssertHead = parseKey(safeParse(assertHead), prefix);
        tmpData.body = Object.fromEntries(pBody);
        tmpData.head = Object.fromEntries(pHead);
        tmpData.assert_body = Object.fromEntries(pAssertBody);
        tmpData.assert_head = Object.fromEntries(pAssertHead);
        return {type: 'json', req: tmpData};
    }

    function parseRequestmsg(selectedRecord) {
        const requestType = selectedRecord.request_args_type;
        const requestHeder = selectedRecord.request_header;
        const requestText = selectedRecord.request_text;
        const requestBody = selectedRecord.request_body;
        const requestFormData = selectedRecord.request_form_data;
        const requestParams = selectedRecord.request_params;
        const requestFormUrlencoded = selectedRecord.request_form_urlencoded;
        const databaseOperates = selectedRecord.database_operates;
        // let newRequestType = ['raw', 'json', 'text', 'x-www-form-urlencoded', null, "form-data"].includes(requestType) ? 'json' : requestType;
        let newRequestType = requestType === 'xml' ? 'xml' : 'json';
        if (requestText !== null) {
            newRequestType = requestText.startsWith('<') ? 'xml': newRequestType;
        }
        if (requestText !== null) return { type: newRequestType, req: requestHeder !== null ? { header: requestHeder, body: requestText} : requestText };
        if (requestBody !== null) return { type: newRequestType, req: requestHeder !== null ? { header: requestHeder, body: requestBody} : requestBody };
        if (requestFormData !== null) return { type: newRequestType, req: requestHeder !== null ? { header: requestHeder, body: requestFormData} : requestFormData };
        if (requestParams !== null) return { type: newRequestType, req: requestHeder !== null ? { header: requestHeder, body: requestParams} : requestParams };
        if (requestFormUrlencoded !== null) return { type: newRequestType, req: requestHeder !== null ? { header: requestHeder, body: requestFormUrlencoded} : requestFormUrlencoded };
        if (databaseOperates !== null) return { type: 'json', req: databaseOperates };
        return { type: newRequestType, req: '' };
    }

    function parseResponseMsg(selectedRecord) {
        const requestType = selectedRecord.request_args_type;
        const responseText = selectedRecord.response_text;
        // let newRequestType = ['raw', 'json', 'text', 'x-www-form-urlencoded', null, "form-data"].includes(requestType) ? 'json' : requestType;
        let newRequestType = requestType === 'xml' ? 'xml' : 'json';
        if (responseText !== null) {
            newRequestType = responseText.startsWith('<') ? 'xml': 'json';
        }
        const responseHeder = selectedRecord.response_header;
        const responseBody = selectedRecord.response_body;
        if (responseBody !== null) return { type: newRequestType, req: newRequestType === 'xml' ? formatXmlContent(responseBody) : responseHeder !== null ? { header: responseHeder, body: responseBody} : responseBody };
        
        if (responseText !== null) return { type: newRequestType, req: newRequestType === 'xml' ? formatXmlContent(responseText) : responseHeder !== null ? { header: responseHeder, body: responseText} : responseText };
        return { type: 'json', req: '' };
    }

    const copyVariables = (record) => {
        const localVariable = record.defined_variables?.reduce((acc, cur) => {
            let item = `${cur.key} ${isObjectAndArray(cur.value) ? cur.value: JSON.stringify(cur.value, null, 2)}`;
            if (cur.desc !== null && cur.desc !== '') {
                item = `${item} ${cur.desc}`;
            }
            acc.push(item);
            return acc;
        },[]);
        const globalVariable = record.session_variables?.reduce((acc, cur) => {
            let item = `${cur.key} ${isObjectAndArray(cur.value) ? cur.value: JSON.stringify(cur.value, null, 2)}`;
            if (cur.desc !== null && cur.desc !== '') {
                item = `${item} ${cur.desc}`;
            }
            acc.push(item);
            return acc;
        },[]);
        return {
            '局部变量': localVariable,
            '全局变量': globalVariable
        };
    }

    return (
        <Card
            style={{ width: '60%', maxHeight: '800px', overflowY: 'auto' }}
            >
            {/* 请求、响应、变量、日志、执行数据 */}
            {[2,4,5].includes(stepType) && <DisplayEnv envInfoArr={envInfo} stepType={stepType} />}
            {[2,4,].includes(stepType) && <Wrapper>
                <Row>
                    <span style={{ marginLeft: 4, marginRight: 6}}>请求Url: </span>
                    <span>{envInfo[0]?.request_url}</span>
                </Row>
            </Wrapper>}
            <Wrapper>
                <>
                    <h4>校验响应</h4>
                    <TextArea autoSize={{ minRows: 0, maxRows: 6 }}  bordered={false} value={selectedRecord.step_exec_except ?? ''} readOnly />
                </>
            </Wrapper>
            <Wrapper>
                <>
                    <h4>断言结果</h4>
                    <AssertStatus assert={selectedRecord.assert_validators}/>
                </>
            </Wrapper>
            <Tabs tabBarStyle={{ paddingLeft: 60 }} defaultActiveKey="hisRequest" activeKey={activeTabs} onChange={e => setActiveTabs(e)} >
                <TabPane tab="请求" key="hisRequest">
                    {selectedRecord.code === null ? <JsonViewer
                        visible={activeTabs === 'hisRequest'}
                        data={parseRequestmsg(selectedRecord)}
                    /> : <EditorControlled value={selectedRecord.code} readOnly={true} height='30vh' />}
                </TabPane>

                <TabPane tab="响应" key="hisResponse">
                    <JsonViewer
                        visible={activeTabs === 'hisResponse'}
                        // data={parseResponse(selectedRecord.response_header, selectedRecord.response_body)}
                        data={parseResponseMsg(selectedRecord)}
                    />
                </TabPane>
                <TabPane tab="变量" key="hisVariable" >
                    <Paragraph  copyable={{ text: JSON.stringify(copyVariables(selectedRecord), null, 2) || ''}}>
                        <VarList vars={selectedRecord?.defined_variables} title="局部" />
                        <VarList vars={selectedRecord?.session_variables} title="全局" />
                    </Paragraph>
                </TabPane>
                <TabPane tab="日志" key="hisLogs">
                    <TextArea autoSize={{ minRows: 6, maxRows: 16 }}  bordered={false} value={selectedRecord?.step_exec_logger} readOnly />
                </TabPane>
                <TabPane tab="执行数据" key="hisExecData" >
                    <JsonViewer
                        visible={activeTabs === 'hisExecData'}
                        data={parseDataSource(selectedRecord?.dataset_snapshot)}
                    />
                </TabPane>
            </Tabs>
        </Card>
    );
};

export default ReportDetailRight;