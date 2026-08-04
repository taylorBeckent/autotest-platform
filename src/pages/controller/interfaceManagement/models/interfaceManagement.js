import { message } from 'antd';
import {
    httpDebugging,
    tcpDebugging,
    executeOrDebugging,
    updateOrCreateTree
} from '../services';

export default {
    namespace: "interfaceManagement",
    state: {
        tableData: [],//.表格数据
        pageInfo: {
            current: 1,
            pageSize: 100,
        },
        total: 0,

        interfaceInfo: {}, //. 接口总数据
        stepTreeList: [], //. 步骤树List
        jsonData: {}, //. requset中的json数据
        xmlData: '', //. requset中的xml数据
        titleProtocalType: 'HTTP', //. 接口管理编辑新增协议类型
    },
    effects: {

        //. 根据脚本ID查步骤树
        * StepTreeSearch({ params, nodeTypeReverseMap, callback }, { call, put }) {
            const res = yield call(stepTreeSearch, { ...params });
            const { code, data } = res;
            if (code == '000000') {
                if (data && data.length > 0 && data[0]?.step_type) { //. 步骤存在验证
                    let finalData = utils.transformStepTreeData(data, nodeTypeReverseMap, 'first', 0);
                    yield put({
                        type: 'syncStepTreeList',
                        stepTreeList: finalData
                    })
                } else {
                    yield put({
                        type: 'syncStepTreeList',
                        stepTreeList: []
                    })
                }
                callback('success');
                message.success(res.message);
            } else {
                callback('faild');
                message.error(res.message);
            }
        },

        //. HTTP请求单步调试
        * HttpDebugging({ params, callback }, { call, put }) {
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
        * ExecuteOrDebugging({ params, callback }, { call }) {
            const res = yield call(executeOrDebugging, {
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
    },
    reducers: {
        syncPageInfo(state, { pageInfo }) {
            return { ...state, pageInfo: { ...pageInfo } };
        },

        syncTableData(state, { tableData }) {
            return { ...state, tableData };
        },

        syncStepTreeList(state, { stepTreeList }) {
            return { ...state, stepTreeList };
        },

        syncInterfaceInfo(state, { interfaceInfo }) {
            return { ...state, interfaceInfo: { ...interfaceInfo } };
        },

        syncJsonData(state, { jsonData }) {
            return { ...state, jsonData };
        },
        syncXmlData(state, { xmlData }) {
            console.log('xmlData-----',xmlData);
            return { ...state, xmlData };
        },
        syncTitleProtocalType(state, { titleProtocalType }) {
            return { ...state, titleProtocalType };
        },
    }
}