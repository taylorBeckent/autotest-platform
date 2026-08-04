import { message } from 'antd';
import utils from '../utils';
import { generateUUID } from '@/utils/utils';
import {
    queryHistoryTableData,
    projectSearch,
    queryEnvApps,
    queryEnvAppsChildConfig,
    tagSearch,
    caseSearch,
    caseDelete,
    stepTreeSearch,
    stepCopyTreeSearch,
    envSearch,
    httpDebugging,
    tcpDebugging,
    executeOrDebugging,
    getEnvNames,
    updateOrCreateTree,
    queryEnv,
    queryHistoryDetailTableData,
    getEffectiveApp,
    queryNames,
    queryCreate,
    deleteCreate,
    uploadCreate,
    sessionVariables,
    deleteSource,
    getConfigNames,
    envQuery
} from '../services';

export default {
    namespace: "scriptManagement",
    state: {
        tableData: [],//.表格总数据
        pageInfo: { current: 1, pageSize: 10 },
        total: 0,

        hisTableData: [],//.表格总数据
        hisPageInfo: { current: 1, pageSize: 100 },
        hisTotal: 0,

        hisDetailTableData: [],//.表格总数据
        hisDetailPageInfo: { current: 1, pageSize: 100 },
        hisDetailTotal: 0,

        applicationList: [], //.系统下拉框
        applicationIdMap: {}, //. 系统反映射
        configList: [], //. 配置名称下拉
        tagsList: [], //. 标签值
        cascaderTagsList: [], //. 标签值 - 级联
        stepTreeList: [], //. 步骤树List
        selectedNode: {}, //.选中树节点info
        envList: [], //.环境下拉
        envNameList: [], //. 环境去重list
        envListSingle: [], //. 单步调试环境list - 带应用
        responseInfo: {}, //.响应信息

        jsonData: '', //. 请求json数据
        xmlData: '', //. 请求xml数据
        currentNodeInfo: {}, //. 当前节点数据

        commonVariable: [], //. 用户变量
        caseInfo: {}, //. 脚本信息（名称、应用、正反案例、标签等）

        stepTreeMiddleList: [], //. 步骤树list中间值（暂存值），在切换是否为公共脚本时，将含引用脚本的信息暂存至当前值
        envOption: [],

        sceneNameList: [], //.测试数据场景List
        dataDrivenTableList: [], //. 生成的测试数据表

        variableList: [], //.变量函数

        /**
         * @param applicationId
         * @param env
         * @param nodeType
         * @param configName
         * 
         * @private ipPortInfo[applicationId][env][nodeType][configName]
        */
        ipPortInfo: {}, //.指定应用列表下的ip/port信息 
        envAppsData: [], // 环境应用
        // interfaceProtocalType: '', // 接口管理编辑新增协议类型
    },
    effects: {

        //.查询历史记录
        * QueryHistoryTableData({ payload, callback }, { call, put, select }) {
            const res = yield call(queryHistoryTableData, {
                ...payload
            });
            const { code, data, status, total } = res;
            if (code == '000000') {
                yield put({
                    type: 'syncHistoryTableData',
                    hisTableData: data
                })
                yield put({
                    type: 'syncHisTotal',
                    hisTotal: total
                })
                callback('success');
                message.success(res.message);
            } else {
                callback('faild');
                message.error(res.message);
            }
        },
        //.查询报告详情
        * QueryHistoryDetailTableData({ payload, callback }, { call, put, select }) {
            const res = yield call(queryHistoryDetailTableData, {
                ...payload
            });
            const { code, data, status } = res;
            if (code == '000000') {
                yield put({
                    type: 'syncHistoryDetailTableData',
                    hisDetailTableData: data
                })
                // callback('success');
                message.success(res.message);
            } else {
                // callback('faild');
                message.error(res.message);
            }
        },

        //.查询应用 
        * ProjectSearch({ params, callback }, { call, put }) {
            const res = yield call(projectSearch, { ...params });
            const { code, data } = res;
            if (code == '000000') {
                let obj = {};
                if (data.length > 0) {
                    data.map(item => {
                        obj[item.project_id] = item.project_name;
                    })
                }
                yield put({
                    type: 'syncApplicationIdMap',
                    applicationIdMap: obj
                })

                yield put({
                    type: 'syncApplicationList',
                    applicationList: data
                })
                // callback('success');
                message.success(res.message);
            } else {
                // callback('faild');
                message.error(res.message);
            }
        },

        //. 查询配置后应用
        * GetEffectiveApp({ params, callback }, { call, put }) {
            const res = yield call(getEffectiveApp, { ...params });
            const { code, data } = res;
            if (code == '000000') {
                let obj = {};
                if (data.length > 0) {
                    data.map(item => {
                        obj[item.project_id] = item.project_name;
                    })
                }

                yield put({
                    type: 'syncApplicationIdMap',
                    applicationIdMap: obj
                })

                yield put({
                    type: 'syncApplicationList',
                    applicationList: data
                })
                // callback('success');
                message.success(res.message);
            } else {
                // callback('faild');
                message.error(res.message);
            }
        },

        //. 应用查询
        * QueryEnvApps({ payload, callback }, { call, put }) {
            const res = yield call(queryEnvApps, {
                ...payload
            });
            const { code, data } = res;
            if (code == '000000') {
                yield put({
                    type: 'syncEnvApps',
                    envAppsData: data,
                })
                message.success(res.message);
            } else {
                message.error(res.message);
            }
        },

        // 查询应用子配置
        *QueryEnvAppsChildConfig({ payload, callback }, { call }) {
            const res = yield call(queryEnvAppsChildConfig, { ...payload });
            const { code, data } = res;
            if (code == '000000') {
                callback(data);
                message.success(res.message);
            } else {
                message.error(res.message);
            }
        },

        //.查询标签
        * TagSearch({ params, callback }, { call, put }) {
            const res = yield call(tagSearch, { ...params });
            const { code, data } = res;
            if (code == '000000') {
                let finalArr = [];
                if (data && data.length > 0) {
                    let categoryArr = []; //. 分类大类
                    data.map(item => {
                        if (categoryArr.indexOf(item.tag_mode) === -1) {
                            categoryArr.push(item.tag_mode);
                        }
                    });

                    for (let i = 0; i < categoryArr.length; i++) {
                        let categoryObj = {
                            id: categoryArr[i],
                            name: categoryArr[i],
                            options: []
                        };
                        for (let j = 0; j < data.length; j++) {
                            if (categoryArr[i] == data[j].tag_mode) {
                                let obj = {};
                                obj.id = data[j].tag_id;
                                obj.label = data[j].tag_name;
                                obj.value = data[j].tag_id;
                                categoryObj.options.push(obj);
                            }
                        }
                        finalArr.push(categoryObj);
                    }
                }

                yield put({
                    type: 'syncTagsList',
                    tagsList: finalArr
                })
                callback('success');
                message.success(res.message);
            } else {
                callback('faild');
                message.error(res.message);
            }
        },

        //.查询标签 - 级联
        * TagSearchCascader({ params, callback }, { call, put }) {
            const res = yield call(tagSearch, { ...params });
            const { code, data } = res;
            if (code == '000000') {
                let finalArr = [];
                if (data && data.length > 0) {
                    let categoryArr = []; //. 分类大类
                    data.map(item => {
                        if (categoryArr.indexOf(item.tag_mode) === -1) {
                            categoryArr.push(item.tag_mode);
                        }
                    });

                    for (let i = 0; i < categoryArr.length; i++) {
                        let categoryObj = {
                            value: categoryArr[i],
                            label: categoryArr[i],
                            children: []
                        };
                        for (let j = 0; j < data.length; j++) {
                            if (categoryArr[i] == data[j].tag_mode) {
                                let obj = {};
                                obj.id = data[j].tag_id;
                                obj.label = data[j].tag_name;
                                obj.value = data[j].tag_id;
                                categoryObj.children.push(obj);
                            }
                        }
                        finalArr.push(categoryObj);
                    }
                }

                yield put({
                    type: 'syncCascaderTagsList',
                    cascaderTagsList: finalArr
                })

                callback('success', data);
                // message.success(res.message);
            } else {
                callback('faild', []);
                message.error(res.message);
            }
        },

        //.查询脚本
        * CaseSearch({ params, callback }, { call, put }) {
            const res = yield call(caseSearch, { ...params });
            const { code, data } = res;
            if (code == '000000') {
                yield put({
                    type: 'syncTableData',
                    tableData: data
                });
                yield put({
                    type: 'syncTotal',
                    total: res?.total || 0
                });
                // callback('success');
                message.success(res.message);
            } else {
                // callback('faild');
                message.error(res.message);
            }
        },

        //. 删除脚本
        * CaseDelete({ params, callback }, { call, put, select }) {
            const res = yield call(caseDelete, { ...params });
            const { code, data } = res;
            if (code == '000000') {
                callback('success');
                message.success(res.message);
            } else {
                callback('faild');
                message.error(res.message);
            }
        },

        //. 根据脚本ID查步骤树 带右侧
        * StepTreeSearch({ params, nodeTypeReverseMap, callback }, { call, put }) {
            const res = yield call(stepTreeSearch, { ...params });
            const { code, data } = res;
            if (code == '000000') {
                let finalData = [];
                if (data && data.length > 0 && data[0]?.step_type) { //. 步骤存在验证
                    finalData = utils.transformStepTreeData(data, nodeTypeReverseMap, 'first', 0);
                    yield put({
                        type: 'syncStepTreeList',
                        stepTreeList: finalData
                    })

                    yield put({
                        type: 'stepTreeMiddleList',
                        treeMiddleList: finalData
                    })
                } else {
                    finalData = utils.transformStepTreeData([], nodeTypeReverseMap, 'first', 0);
                    yield put({
                        type: 'syncStepTreeList',
                        stepTreeList: finalData
                    })

                    yield put({
                        type: 'stepTreeMiddleList',
                        treeMiddleList: finalData
                    })
                }
                callback('success', finalData);
                message.success(res.message);
            } else {
                callback('faild', []);
                message.error(res.message);
            }
        },
        //. 接口查询协议类型专用
        * StepInterFacrProtoTypeSearch({ params, callback }, { call, put }) {
            const res = yield call(stepTreeSearch, { ...params });
            const { code, data } = res;
            if (code == '000000') {
                callback('success', data);
                message.success(res.message);
            } else {
                callback('faild', []);
                message.error(res.message);
            }
        },

        //. 保存后-根据脚本ID查步骤树
        * StepTreeReSearch({ params, nodeTypeReverseMap, callback }, { call, put }) {
            const res = yield call(stepTreeSearch, { ...params });
            const { code, data } = res;
            if (code == '000000') {
                let finalData = [];
                if (data && data.length > 0 && data[0]?.step_type) { //. 步骤存在验证
                    finalData = utils.transformStepTreeData(data, nodeTypeReverseMap, 'first', 0);
                } else {
                    finalData = utils.transformStepTreeData([], nodeTypeReverseMap, 'first', 0);
                }
                callback('success', finalData);
                message.success(res.message);
            } else {
                callback('faild', []);
                message.error(res.message);
            }
        },

        //. 根据脚本ID查步骤树(查询公共脚本下的步骤树)
        * CommonStepTreeSearch({ params, nodeTypeReverseMap, callback }, { call, put }) {
            const res = yield call(stepTreeSearch, { ...params });
            const { code, data } = res;
            if (code == '000000') {
                let finalData = [];
                if (data && data.length > 0 && data[0]?.step_type) { //. 步骤存在验证
                    finalData = utils.transformStepTreeData(data, nodeTypeReverseMap, 'quote', 0);

                    let currentID = generateUUID();
                    let varibaleObj = {
                        id: `item-fixed-${currentID}`,
                        step_id: `item-fixed-${currentID}`,
                        nodeType: 0,
                        step_type: '用户变量',
                        content: '用户变量',
                        step_name: '用户变量',
                        depth: 0,
                        isHovered: false,
                        isSelected: false,
                        draggable: false,
                        collapse: true,
                        haveChild: false,
                        childNode: [],
                        quote_steps: [],
                        isQuote: true,
                        session_variables: data[0]?.case?.session_variables
                    };
                    finalData.unshift(varibaleObj);
                } else {
                    finalData = utils.transformStepTreeData([], nodeTypeReverseMap, 'quote', 0);
                }

                callback('success', finalData);
                message.success(res.message);
            } else {
                callback('faild', []);
                message.error(res.message);
            }
        },

        //. 执行时-根据脚本ID查步骤树
        * StepTreeExecuteSearch({ params, nodeTypeReverseMap, callback }, { call, put }) {
            const res = yield call(stepTreeSearch, { ...params });
            const { code, data } = res;
            if (code == '000000') {
                let finalData = [];
                if (data && data.length > 0 && data[0]?.step_type) finalData = data;

                callback('success', finalData);
                // message.success(res.message);
            } else {
                callback('faild', []);
                message.error(res.message);
            }
        },

        //. 复制脚本查询步骤树
        * ScriptCopyTreeSearch({ params, nodeTypeReverseMap, callback }, { call, put }) {
            const res = yield call(stepCopyTreeSearch, { ...params });
            const { code, data } = res;
            if (code == '000000') {
                let finalData = [];
                if (data?.steps && data?.steps.length > 0 && data?.steps[0]?.step_type) { //. 步骤存在验证
                    finalData = utils.transformStepTreeData(data?.steps, nodeTypeReverseMap, 'copyScript', 0);
                    yield put({
                        type: 'syncStepTreeList',
                        stepTreeList: finalData
                    })

                    yield put({
                        type: 'stepTreeMiddleList',
                        treeMiddleList: finalData
                    })
                } else {
                    finalData = utils.transformStepTreeData([], nodeTypeReverseMap, 'copyScript', 0);
                    yield put({
                        type: 'syncStepTreeList',
                        stepTreeList: finalData
                    })

                    yield put({
                        type: 'stepTreeMiddleList',
                        treeMiddleList: finalData
                    })
                }
                callback('success', data, finalData);
                message.success(res.message);
            } else {
                callback('faild', {}, []);
                message.error(res.message);
            }
        },

        //. 根据脚本ID查步骤树 - 复制步骤
        * StepCopyTreeSearch({ params, nodeTypeReverseMap, callback }, { call, put, select }) {
            const { stepTreeList, commonVariable } = yield select(({ scriptManagement }) => scriptManagement);
            const res = yield call(stepCopyTreeSearch, { ...params });
            const { code, data } = res;
            if (code == '000000') {
                let resData = [];
                let finalData = [];
                if (data?.steps && data?.steps.length > 0 && data?.steps[0]?.step_type) { //. 步骤存在验证
                    let treeListCopy = JSON.parse(JSON.stringify(stepTreeList));
                    let commonVariableCopy = JSON.parse(JSON.stringify(commonVariable));

                    resData = utils.transformStepTreeData(data?.steps, nodeTypeReverseMap, 'copy', 0);
                    finalData = [...treeListCopy, ...resData];

                    //. 用户变量合并
                    if (data?.case?.session_variables && data?.case?.session_variables.length > 0) {
                        const resVariablesKeys = new Set(data?.case?.session_variables.map(item => item.key));
                        const intersection = commonVariableCopy.filter(item => resVariablesKeys.has(item.key));

                        if (intersection.length > 0) {
                            let intersectionStr = '';
                            intersection.forEach(item => { intersectionStr += `${item.key}、` });
                            const duplicateStr = intersectionStr.slice(0, -1);
                            message.warn(`所选脚本的用户变量 和 当前脚本用户变量存在重复变量名：${duplicateStr}, 请检查`, 6);
                        }

                        let finalCommonVariable = [...commonVariableCopy];
                        data.case.session_variables.forEach(item => {
                            item.id = generateUUID();
                            finalCommonVariable.push(item);
                        })

                        yield put({
                            type: 'syncCommonVariable',
                            commonVariable: finalCommonVariable
                            // commonVariable: [...commonVariableCopy, ...data.case.session_variables]
                        })
                    }

                    yield put({
                        type: 'syncSelectedNode',
                        selectedNode: {}
                    })

                    yield put({
                        type: 'syncStepTreeList',
                        stepTreeList: finalData
                    })

                    yield put({
                        type: 'stepTreeMiddleList',
                        treeMiddleList: finalData
                    })
                }
                callback('success', resData, data?.case);
                message.success(res.message);
            } else {
                callback('faild', []);
                message.error(res.message);
            }
        },

        //. 环境查询
        * EnvSearch({ params, callback }, { call, put }) {
            const res = yield call(envSearch, params);
            const { code, data } = res;
            if (code === '000000') {
                yield put({
                    type: 'syncEnvList',
                    envList: data
                })
                // callback('success');
                message.success(res.message);
            } else {
                // callback('failed');
                message.error(res.message);
            }
        },

        //. 环境查询（去重）
        * GetEnvNames({ params, callback }, { call, put }) {
            const res = yield call(getEnvNames, params);
            const { code, data } = res;
            if (code === '000000') {
                yield put({
                    type: 'syncEnvNameList',
                    envNameList: data
                })

                callback('success', data);
            } else {
                callback('failed', data);
                message.error(res.message);
            }
        },

        //. HTTP请求单步调试
        * HttpDebugging({ params, callback }, { call, put, select }) {
            // const { stepTreeList } = yield select(({ scriptManagement }) => scriptManagement);
            const res = yield call(httpDebugging, {
                ...params
            });
            const { code, data } = res;
            if (code === '000000') {
                // let copyTreeList = JSON.parse(JSON.stringify(stepTreeList));
                data.id = params.id;
                yield put({
                    type: 'syncResponseInfo',
                    responseInfo: data
                })
                callback('success');
                message.success(res.message);
            } else {
                callback('failed');
                message.error(res.message);
            }
        },
        //. TCP请求单步调试
        * TcpDebugging({ params, callback }, { call, put }) {
            // const { stepTreeList } = yield select(({ scriptManagement }) => scriptManagement);
            const res = yield call(tcpDebugging, {
                ...params
            });
            const { code, data } = res;
            if (code === '000000') {
                // let copyTreeList = JSON.parse(JSON.stringify(stepTreeList));
                data.id = params.id;
                yield put({
                    type: 'syncResponseInfo',
                    responseInfo: data
                })
                callback('success');
                message.success(res.message);
            } else {
                callback('failed');
                message.error(res.message);
            }
        },
        //. HTTP请求全量调试
        * ExecuteOrDebugging({ params, callback }, { call, put, select }) {
            const res = yield call(executeOrDebugging, {
                ...params
            });
            try {
                const { code, data } = res;
                if (code === '000000') {
                    callback('success');
                    message.success(res.message);
                } else {
                    callback('failed');
                    message.error(res.message);
                }
            } catch (error) {
                callback('error');
                throw error;
            }
        },

        //. 脚本编辑页面 - 保存/新增
        * UpdateOrCreateTree({ params, callback }, { call, put, select }) {
            const res = yield call(updateOrCreateTree, {
                ...params
            });
            const { code, data } = res;
            if (code === '000000') {
                callback('success', data);
                message.success(res.message);
            } else {
                callback('failed', data);
                message.error(res.message);
            }
        },
        //. 执行环境查询
        * QueryEnv({ params, callback }, { call, put, select }) {
            const res = yield call(queryEnv, {
                ...params
            });
            const { code, data } = res;
            if (code === '000000') {
                yield put({
                    type: 'syncEnvOption',
                    envOption: data
                })
                message.success(res.message);
            } else {
                callback('failed', data);
                message.error(res.message);
            }
        },

        //. 数据驱动场景查询
        * QueryNames({ params, callback }, { call, put, select }) {
            const res = yield call(queryNames, {
                ...params
            });
            const { code, data } = res;
            let newList = [];
            if (code === '000000' && data.length > 0) {
                data.forEach(item => {
                    let obj = {};
                    obj.dataSetName = item;
                    newList.push(obj);
                })
                callback('success', data);
                message.success(res.message);
            } else {
                callback('failed', []);
                message.error(res.message);
            }
            yield put({
                type: 'syncSceneNameList',
                sceneNameList: newList
            })
        },

        //. 数据驱动生成表格查询
        * QueryCreate({ params, callback }, { call, put, select }) {
            const res = yield call(queryCreate, {
                ...params
            });
            const { code, data } = res;
            let newList = [];
            if (code === '000000') {
                newList = data;
                callback('success', data);
                message.success(res.message);
            } else {
                callback('failed', []);
                message.error(res.message);
            }
            yield put({
                type: 'syncDataDrivenTableList',
                dataDrivenTableList: newList
            })
        },

        //. 数据驱动-删除
        * DeleteCreate({ params, callback }, { call, put, select }) {
            const res = yield call(deleteCreate, {
                ...params
            });
            const { code, data } = res;
            if (code === '000000') {
                callback('success');
                message.success(res.message);
            } else {
                callback('failed');
                message.error(res.message);
            }
        },

        //. 数据驱动-生成
        * UploadCreate({ params, callback }, { call, put, select }) {
            const res = yield call(uploadCreate, params);
            const { code, data } = res;
            let newList = [];
            if (code === '000000') {
                callback('success');
                message.success(res.message);
            } else {
                callback('failed');
                message.error(res.message);
            }
        },

        //. 查询变量函数
        * SessionVariables({ params, callback }, { call, put }) {
            const res = yield call(sessionVariables, params);
            const { code, data } = res;
            if (code === '000000') {
                yield put({
                    type: 'syncVariableList',
                    variableList: data
                })
                callback('success');
                message.success(res.message);
            } else {
                yield put({
                    type: 'syncVariableList',
                    variableList: []
                })
                callback('failed');
                message.error(res.message);
            }
        },

        //. 数据驱动文件删除
        * DeleteSource({ params, callback }, { call, put }) {
            const res = yield call(deleteSource, params);
            const { code, data } = res;
            if (code === '000000') {
                callback('success');
                message.success(res.message);
            } else {
                callback('failed');
                message.error(res.message);
            }
        },

        //. 数据驱动文件删除
        * GetConfigNames({ params, callback }, { call, put }) {
            const res = yield call(getConfigNames, params);
            const { code, data } = res;
            if (code === '000000') {
                yield put({
                    type: 'syncConfigList',
                    configList: data
                })
                callback('success');
                message.success(res.message);
            } else {
                callback('failed');
                message.error(res.message);
            }
        },

        //. 查询指定应用列表下的ip/port信息
        * EnvQuery({ params, callback }, { call, put }) {
            const res = yield call(envQuery, params);
            const { code, data } = res;
            if (code === '000000') {
                yield put({
                    type: 'syncIpPortInfo',
                    ipPortInfo: data
                })
                callback('success');
            } else {
                callback('failed');
                message.error(res.message);
            }
        }
    },
    reducers: {
        //.修改页签
        syncEnvOption(state, { envOption }) {
            return { ...state, envOption: envOption }
        },
        //.修改页签
        syncPageInfo(state, { pageInfo }) {
            return { ...state, pageInfo: { ...pageInfo } }
        },
        //.修改全表数据
        syncTableData(state, { tableData }) {
            return { ...state, tableData }
        },
        syncTotal(state, { total }) {
            return { ...state, total }
        },
        //.修改历史记录页签
        syncHistoryPageInfo(state, { pageInfo }) {
            return { ...state, hisPageInfo: { ...pageInfo } }
        },
        //.修改历史记录数据
        syncHistoryTableData(state, { hisTableData }) {
            return { ...state, hisTableData }
        },
        syncHisTotal(state, { hisTotal }) {
            return { ...state, hisTotal };
        },
        //.修改报告详情页签
        syncHIstoryDetailPageInfo(state, { pageInfo }) {
            return { ...state, hisDetailPageInfo: { ...pageInfo } }
        },
        //.修改全表数据
        syncHistoryDetailTableData(state, { hisDetailTableData }) {
            return { ...state, hisDetailTableData }
        },

        syncApplicationList(state, { applicationList }) {
            return { ...state, applicationList };
        },

        syncEnvApps(state, { envAppsData }) {
            return { ...state, envAppsData };
        },

        syncTagsList(state, { tagsList }) {
            return { ...state, tagsList };
        },

        syncCascaderTagsList(state, { cascaderTagsList }) {
            return { ...state, cascaderTagsList };
        },

        syncStepTreeList(state, { stepTreeList }) {
            return { ...state, stepTreeList };
        },

        syncSelectedNode(state, { selectedNode }) {
            return { ...state, selectedNode: { ...selectedNode } };
        },

        syncEnvList(state, { envList }) {
            return { ...state, envList };
        },

        syncEnvNameList(state, { envNameList }) {
            return { ...state, envNameList };
        },

        syncEnvListSingle(state, { envListSingle }) {
            return { ...state, envListSingle };
        },

        syncResponseInfo(state, { responseInfo }) {
            return { ...state, responseInfo };
        },

        syncJsonData(state, { jsonData }) {
            return { ...state, jsonData };
        },
        syncXmlData(state, { xmlData }) {
            return { ...state, xmlData };
        },

        syncCurrentNodeInfo(state, { currentNodeInfo }) {
            return { ...state, currentNodeInfo };
        },

        syncCommonVariable(state, { commonVariable }) {
            return { ...state, commonVariable }
        },

        syncCaseInfo(state, { caseInfo }) {
            return { ...state, caseInfo: { ...caseInfo } }
        },

        syncStepTreeMiddleList(state, { stepTreeMiddleList }) {
            return { ...state, stepTreeMiddleList: { ...stepTreeMiddleList } };
        },

        syncSceneNameList(state, { sceneNameList }) {
            return { ...state, sceneNameList };
        },

        syncDataDrivenTableList(state, { dataDrivenTableList }) {
            return { ...state, dataDrivenTableList };
        },

        syncVariableList(state, { variableList }) {
            return { ...state, variableList };
        },

        syncConfigList(state, { configList }) {
            return { ...state, configList };
        },

        syncIpPortInfo(state, { ipPortInfo }) {
            return { ...state, ipPortInfo };
        },

        syncApplicationIdMap(state, { applicationIdMap }) {
            return { ...state, applicationIdMap };
        },
        // syncInterfaceProtocalType(state, { interfaceProtocalType }) {
        //     return { ...state, interfaceProtocalType };
        // },

    }
}