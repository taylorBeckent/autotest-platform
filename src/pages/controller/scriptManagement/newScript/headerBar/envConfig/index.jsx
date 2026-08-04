import React, { useEffect, useState } from 'react';
import { Select, Button, Modal, Segmented, Form, message } from 'antd';
import { connect } from 'umi';
import { generateUUID } from '@/utils/utils';
import styles from './index.less';
import TableComponent from './TableComponent';

const nodeTypeClassify = {
    'HTTP请求': 'APP',
    'TCP请求': 'APP',
    '数据库请求': 'DB'
};

const EnvConfigModal = (props) => {
    const {
        dispatch,
        status,
        finalList,
        debugParams,
        onCancel,
        onRefreshDebugLog,
        scriptManagement: { ipPortInfo, applicationIdMap }
    } = props;

    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [envMode, setEnvMode] = useState('single');
    const [configData, setConfigData] = useState([]);
    const [envList, setEnvList] = useState([]);
    const [subEnvList, setSubEnvList] = useState([]); //. 全量环境
    const [globalEnvMap, setGlobalEnvMap] = useState({});

    const [appData, setAppData] = useState([]);
    const [fileData, setFileData] = useState([]);
    const [dbData, setDbData] = useState([]);

    const [selectdInfo, setSelectedInfo] = useState({});

    const appMap = new Map();

    useEffect(() => {
        dataAggregate(finalList);

        if ([...appMap.values()].length > 0) {
            searchIpPortInfo([...appMap.keys()]);
            searchEnvList([...appMap.keys()]);
        }
        setConfigData([...appMap.values()]);
        handleSelected([...appMap.values()][0]);
    }, [])

    const modeOptions = [
        { label: '单环境', value: 'single' },
        { label: '多环境', value: 'multiple' }
    ];

    useEffect(() => {
        if (configData.length > 0 && selectdInfo?.applicationId && !isEmptyObj(globalEnvMap)) {
            setSubEnvList(globalEnvMap[selectdInfo?.applicationId]);
            handleSplitData();
        }
    }, [configData, selectdInfo, globalEnvMap])

    const isEmptyObj = (obj) => {
        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return false;
        return Object.keys(obj).length === 0;
    };

    //. 查询环境
    const searchEnvList = (applicationList) => {
        dispatch({
            type: 'scriptManagement/GetEnvNames',
            params: {
                project_id: applicationList
            },
            callback: (flag, resData) => {
                let envArr = [];
                let finalArr = [];
                if (flag === 'success') {
                    for (let appKey in resData) {
                        for (let typeKey in resData[appKey]) {
                            envArr = [...envArr, ...resData[appKey][typeKey]];
                        }
                    }
                    finalArr = [...new Set(envArr)];
                }
                setEnvList(finalArr);
                flag === 'success' && setGlobalEnvMap(resData);
            }
        });
    };

    //. 查询ip信息
    const searchIpPortInfo = (applicationList) => {
        dispatch({
            type: 'scriptManagement/EnvQuery',
            params: {
                project_ids: applicationList
            },
            callback: _ => { }
        })
    };

    //. 数据切分
    const handleSplitData = () => {
        let copyList = JSON.parse(JSON.stringify(configData));
        copyList.map(item => {
            if (item.applicationId === selectdInfo.applicationId) {
                let appList = [], fileList = [], dbList = [];
                if (item.childConfig.length > 0) {
                    item.childConfig.map(childItem => {
                        if (childItem.type === "APP") {
                            appList.push(childItem);
                        } else if (childItem.type === "FILE") {
                            fileList.push(childItem);
                        } else {
                            dbList.push(childItem);
                        }
                    })
                    setAppData(appList);
                    setFileData(fileList);
                    setDbData(dbList);
                }
            }
        })
    };

    //. 数据聚合
    const dataAggregate = (testList) => {
        let copyList = JSON.parse(JSON.stringify(testList));

        copyList.forEach(item => {

            if (item.step_type === '引用公共脚本/接口') {
                dataAggregate(item.quote_steps);
                return;
            }

            if (item.step_type === '数据库请求') {
                item.database_operates.map((dbItem, index) => {
                    if (!dbItem.project_id) return;
                    if (appMap.has(dbItem.project_id)) { //. 已存在

                        let curValue = appMap.get(dbItem.project_id);
                        if (curValue.childConfig.length === 0 || curValue.configList.indexOf(dbItem.config_name + nodeTypeClassify[item.step_type]) === -1) {

                            let obj = {};
                            obj.id = generateUUID();
                            obj.configName = dbItem?.config_name;
                            obj.type = nodeTypeClassify[item.step_type];
                            obj.stepList = [item.step_id ? (item.step_id + '_@@' + index) : ('@@' + item.step_name + '_@@' + index)];

                            curValue.childConfig.push(obj);
                            curValue.configList.push(dbItem.config_name + nodeTypeClassify[item.step_type]);

                        } else {
                            //. 加一条步骤id
                            for (let i = 0; i < curValue.childConfig.length; i++) {
                                if (dbItem?.config_name === curValue.childConfig[i].configName) {
                                    curValue.childConfig[i].stepList.push(item.step_id ? (item.step_id + '_@@' + index) : ('@@' + item.step_name + '_@@' + index));
                                }
                            }
                        }

                        appMap.set(dbItem.project_id, curValue);

                    } else {
                        let obj = {};
                        let stepList = [];
                        stepList.push(item.step_id ? (item.step_id + '_@@' + index) : ('@@' + item.step_name + '_@@' + index));

                        obj.applicationId = dbItem.project_id;
                        obj.applicationName = applicationIdMap[dbItem.project_id];
                        obj.configList = [dbItem.config_name + nodeTypeClassify[item.step_type]];
                        obj.isSelected = false;
                        obj.childConfig = [{ id: generateUUID(), configName: dbItem?.config_name, type: nodeTypeClassify[item.step_type], stepList }];

                        appMap.set(dbItem.project_id, obj);
                    }
                })
            }

            if (!item.request_project_id) return;

            if (appMap.has(item.request_project_id)) { //. 已存在，添加

                let curValue = appMap.get(item.request_project_id);
                if (curValue.childConfig.length === 0 || curValue.configList.indexOf(item.request_config_name + nodeTypeClassify[item.step_type]) === -1) {

                    let obj = {};
                    obj.id = generateUUID();
                    obj.configName = item?.request_config_name;
                    obj.type = nodeTypeClassify[item.step_type];
                    obj.stepList = [item.step_id || ('@@' + item.step_name)];

                    curValue.childConfig.push(obj);
                    curValue.configList.push(item.request_config_name + nodeTypeClassify[item.step_type]);

                } else {
                    //. 加一条步骤id
                    for (let i = 0; i < curValue.childConfig.length; i++) {
                        if (item.request_config_name === curValue.childConfig[i].configName) {
                            curValue.childConfig[i].stepList.push(item.step_id || ('@@' + item.step_name));
                        }
                    }
                }

                appMap.set(item.request_project_id, curValue);
            } else { //. 未存在， 初始化
                let obj = {};
                let stepList = [];
                stepList.push(item.step_id || ('@@' + item.step_name));

                obj.applicationId = item.request_project_id;
                obj.applicationName = applicationIdMap[item.request_project_id];
                obj.configList = [item.request_config_name + nodeTypeClassify[item.step_type]];
                obj.isSelected = false;
                obj.childConfig = [{ id: generateUUID(), configName: item?.request_config_name, type: nodeTypeClassify[item.step_type], stepList }];

                appMap.set(item.request_project_id, obj);
            }
        })
    };

    //.选中节点
    const handleSelected = (record) => {
        setConfigData(prev => {
            let newList = prev.map(item => {
                if (item.applicationId === record.applicationId) {
                    item.isSelected = true;
                } else {
                    item.isSelected = false;
                }
                return item;
            })

            return newList;
        })
        setSelectedInfo({ ...record, isSelected: true });
    };

    //. 更新数据
    const updateRow = (applicationId, id, field, value) => {
        setConfigData(prev => {
            let newList = prev.map(cur => {
                if (cur.applicationId === applicationId) {
                    cur.childConfig.map(item => {
                        item.id === id && (item[field] = value);
                        return item;
                    })
                }
                return cur;
            })
            return newList;
        })
    };

    //. 批量更新弹窗数据
    const batchUpdateRow = (applicationId, id, updateList) => {
        setConfigData(prev => {
            let newList = prev.map(cur => {
                if (cur.applicationId === applicationId) {
                    cur.childConfig.map(item => {
                        if (item.id === id) {
                            updateList.forEach(updateItem => {
                                item[updateItem.field] = updateItem.value;
                            })
                        }

                        return item;
                    })
                }
                return cur;
            })
            return newList;
        })
    };

    //. 全局环境变更
    const globalEnvChange = (e) => {
        setConfigData(prev => {
            let newList = prev.map(cur => {
                cur.childConfig.map(item => {
                    item.env = e;
                    item.ip = ipPortInfo[cur.applicationId]?.[e]?.[item.type]?.[item.configName]?.config_host || undefined;
                    item.port = ipPortInfo[cur.applicationId]?.[e]?.[item.type]?.[item.configName]?.config_port || undefined;
                    item.type == 'DB' && (item.database_name = ipPortInfo[cur.applicationId]?.[e]?.[item.type]?.[item.configName]?.database_name || undefined);
                    return item;
                })
                return cur;
            })

            return newList;
        })
    };

    //. 调试
    const handleOK = () => {
        let allStepMap = {}; //. 全量步骤id/name
        let ipPortCheckFlag = false;
        configData.map(cur => {
            cur.childConfig.map(item => {
                if (!item.ip || !item.port || item.stepList.length === 0) ipPortCheckFlag = true;
                let obj = {};
                obj.env_name = item.env;
                obj.config_type = item.type;
                obj.config_name = item.configName;
                obj.config_host = item.ip;
                obj.config_port = item.port;
                obj.database_name = item?.database_name || null;

                item.stepList.map(stepItem => {
                    allStepMap[stepItem] = obj;
                })
            })
        })

        if (ipPortCheckFlag) {
            message.error('存在ip/端口为空的数据，请检查环境管理中-该应用和环境下是否配置ip信息');
            return;
        }

        let params = JSON.parse(JSON.stringify(debugParams));
        params.steps_execute_config = allStepMap;

        setLoading(true);
        dispatch({
            type: 'scriptManagement/ExecuteOrDebugging',
            params,
            callback: _ => {
                // setSceneStatus(false);
                setLoading(false);
                onCancel();
                onRefreshDebugLog && onRefreshDebugLog(true);
            }
        })
    };

    return (
        <Modal
            title="脚本执行配置"
            visible={status !== 'closed'}
            width={1200}
            maskClosable={false}
            onCancel={onCancel}
            footer={[
                <>
                    <Button type="primary" loading={loading} onClick={handleOK} >确定</Button>
                </>
            ]}
        >
            {Array.isArray(configData) && configData.length > 0 ?
                <div className={styles['config-wrapper']}>
                    <div className={styles['header']}>
                        <div className={styles['header-left']}>
                            脚本执行配置（{Array.isArray(configData) ? configData.length : 0}个应用）
                        <Form form={form}>
                                <Form.Item labelCol={{ span: 12 }} wrapperCol={{ span: 12 }} label="全局环境" name="globalEnv"
                                    rules={[{ required: envMode == 'single', message: '请选择全局环境' }]}
                                >
                                    <Select
                                        showSearch
                                        placeholder="全局环境"
                                        style={{ marginLeft: 15, width: 150 }}
                                        onChange={globalEnvChange}
                                    >
                                        {envList.length > 0 && envList.map(item => (
                                            <Option key={item} value={item}>{item}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Form>
                        </div>
                        <Segmented styles={{ item: { '--ant-item-selected-bg': '#1677ff' } }} options={modeOptions} value={envMode} onChange={e => { setEnvMode(e) }} />
                    </div>
                    <div className={styles['content']}>
                        <div className={`${styles['left-side']} ${(Array.isArray(configData) && configData.length > 1) ? '' : styles['left-side-none']}`}>
                            {Array.isArray(configData) && configData.length > 0 && configData.map(item => (
                                <div className={`${styles['app-component']} ${item.isSelected && styles['app-component-selected']}`} key={item.applicationId} onClick={() => { handleSelected(item) }} >
                                    <div>{item?.applicationName}</div>
                                    <div>{item?.childConfig.length}条配置</div>
                                </div>
                            ))}
                        </div>
                        <div className={`${styles['right-side']} ${(Array.isArray(configData) && configData.length > 1) ? '' : styles['right-side-all']}`}>
                            {selectdInfo?.applicationId && (
                                <div className={styles['right-content']}>
                                    <div className={styles['content-header']}>
                                        <div className={styles['content-title']}>{selectdInfo?.applicationName}</div>
                                        <div className={styles['content-subTitle']}>{selectdInfo?.childConfig.length} 条配置</div>
                                    </div>
                                    <div className={styles['content-tables']}>
                                        {appData.length > 0 && <TableComponent type="APP" dataList={appData} selectdInfo={selectdInfo} updateRow={updateRow} batchUpdateRow={batchUpdateRow} envMode={envMode} ipPortInfo={ipPortInfo} subEnvList={subEnvList} />}
                                        {fileData.length > 0 && <TableComponent type="FILE" dataList={fileData} selectdInfo={selectdInfo} updateRow={updateRow} batchUpdateRow={batchUpdateRow} envMode={envMode} ipPortInfo={ipPortInfo} subEnvList={subEnvList} />}
                                        {dbData.length > 0 && <TableComponent type="DB" dataList={dbData} selectdInfo={selectdInfo} updateRow={updateRow} batchUpdateRow={batchUpdateRow} envMode={envMode} ipPortInfo={ipPortInfo} subEnvList={subEnvList} />}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                : <div className={styles['empty-style']}>
                    当前脚本中所包含的步骤树类型无需选择环境，请点击确定按钮进行调试
                </div>
            }

        </Modal>
    )
}



export default connect(({ scriptManagement }) => ({
    scriptManagement,
}))(EnvConfigModal);