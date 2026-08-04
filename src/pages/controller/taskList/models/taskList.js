import { message } from 'antd';
import {
    queryTableData,
    queryTiskTableData,
    queryHistoryTableData,
    queryExeTaskTableData,
    create,
    deleteTable,
    querySystemList,
    queryEnvList,
    queryDetailTaskList,
    saveEditTable,
    executeTable
} from '../services';

export default {
    namespace: "taskList",
    state: {
        tableData: [],//.表格总数据
        pageInfo: {
            current: 1,
            pageSize: 10,
        },
        total: 0,
        tableTaskData: [],//.表格总数据
        pageTaskInfo: {
            current: 1,
            pageSize: 10,
        },
        taskTotal: 0,
        hisTableData: [],//.表格总数据
        hisPageInfo: {
            current: 1,
            pageSize: 10,
        },
        hisTotal: 0,
        hisExeTableData: [
            {
                taskName: '123'
            }
        ],//.表格总数据
        hisExePageInfo: {
            current: 1,
            pageSize: 10,
        },
        hisExeTotal: 0,
        hisExeWatchTableData: [
            {
                taskName: '123'
            }
        ],//.表格总数据
        hisExeWatchPageInfo: {
            current: 1,
            pageSize: 10,
        },
        hisExeWatchTotal: 0,
        envOption: [],//.环境下拉框
        systemOption: [],//.系统下拉框
    },
    effects: {
        //.执行
        * ExecuteTable({ payload, callback }, { call, put, select }) {
            const res = yield call(executeTable, {
                ...payload
            });
            const { code, data, status } = res;
            if (code == '000000') {
                message.success(res.message);
            } else {
                message.error(res.message);
            }
            callback()
        },
        //.查询
        * QueryTableData({ payload, callback }, { call, put, select }) {
            const res = yield call(queryTableData, {
                ...payload
            });
            const { code, data, status } = res;
            if (code == '000000') {
                yield put({
                    type: 'syncTableData',
                    tableData: data,
                    total: res.total
                })
                // callback('success');
                message.success(res.message);
            } else {
                // callback('faild');
                message.error(res.message);
            }
        },
        //.删除
        * DeleteTable({ payload, callback }, { call, put, select }) {
            const res = yield call(deleteTable, {
                ...payload
            });
            const { code, data, status } = res;
            if (code == '000000') {

                callback('success');
                message.success(res.message);
            } else {
                callback('faild');
                message.error(res.message);
            }
        },
        //.新增
        * Create({ params, callback }, { call, put, select }) {
            const res = yield call(create, {
                ...params
            });
            const { code, data, status } = res;
            if (code == '000000') {
                // yield put({
                //     type: 'syncTableData',
                //     tableData: data?.list
                // })
                message.success(res.message);
            }else{
                message.error(res.message);
            }
            callback(code);

            //  else {
            //     callback('faild');
            //     message.error(res.message);
            // }
        },
        //.查询新增
        * QueryTiskTableData({ params, callback }, { call, put, select }) {
            const res = yield call(queryTiskTableData, {
                ...params
            });
            const { code, data, status } = res;
            if (code == '000000') {
                yield put({
                    type: 'syncTableTiskData',
                    tableTaskData: data?.list
                })
                callback('success');
                message.success(res.message);
            } else {
                callback('faild');
                message.error(res.message);
            }
        },
        //.查询历史记录
        * QueryHistoryTableData({ payload, callback }, { call, put, select }) {
            const res = yield call(queryHistoryTableData, {
                ...payload
            });
            const { code, data, status } = res;
            if (code == '000000') {
                yield put({
                    type: 'syncHistoryTableData',
                    hisTableData: data,
                    hisTotal: res.total
                })
                // callback('success');
                message.success(res.message);
            } else {
                // callback('faild');
                message.error(res.message);
            }
        },
        //.历史记录点击查看表格
        * QueryExeTaskTableData({ payload, callback }, { call, put, select }) {
            const res = yield call(queryExeTaskTableData, {
                ...payload
            });
            const { code, data, status } = res;
            if (code == '000000') {
                yield put({
                    type: 'syncHisExeTableData',
                    hisExeTableData: data
                })
                // callback('success');
                message.success(res.message);
            } else {
                // callback('faild');
                message.error(res.message);
            }
        },
        //.环境下拉框
        * QueryEnvList({ params, callback }, { call, put, select }) {
            const res = yield call(queryEnvList, {
                ...params
            });
            const { code, data, status } = res;
            if (code == '000000') {
                yield put({
                    type: 'syncEnvData',
                    envOption: data
                })
                // callback('success');
                message.success(res.message);
            } else {
                // callback('faild');
                message.error(res.message);
            }
        },
        //.系统下拉框
        * QuerySystemList({ params, callback }, { call, put, select }) {
            const res = yield call(querySystemList, {
                ...params
            });
            const { code, data, status } = res;
            if (code == '000000') {
                yield put({
                    type: 'syncSystemData',
                    systemOption: data
                })
                // callback('success');
                message.success(res.message);
            } else {
                // callback('faild');
                message.error(res.message);
            }
        },
        //.任务编辑查看详情
        * QueryDetailTaskList({ payload, callback }, { call, put, select }) {
            const res = yield call(queryDetailTaskList, {
                ...payload
            });
            const { code, data, status } = res;
            if (code == '000000') {

                callback(data[0]);
                message.success(res.message);
            } else {
                // callback('faild');
                message.error(res.message);
            }
        },
        //.编辑保存表格
        * SaveEditTable({ payload, callback }, { call, put, select }) {
            const res = yield call(saveEditTable, {
                ...payload
            });
            const { code, data, status } = res;
            if (code == '000000') {
                callback(code);
                message.success(res.message);
            } else {
                // callback('faild');
                message.error(res.message);
            }
        },
        // //.查看执行任务历史记录
        // * QueryWatchExeTaskTableData({ params, callback }, { call, put, select }) {
        //     const res = yield call(queryHistoryTableData, {
        //         ...params
        //     });
        //     const { code, data, status } = res;
        //     if (code == '000000') {
        //         yield put({
        //             type: 'syncHisExeWatchTableData',
        //             hisExeWatchTableData: data?.list
        //         })
        //         // callback('success');
        //         message.success(res.message);
        //     } else {
        //         // callback('faild');
        //         message.error(res.message);
        //     }
        // },

    },
    reducers: {
        //.修改页签
        syncPageInfo(state, { pageInfo }) {
            return { ...state, pageInfo: { ...pageInfo } }
        },
        //.修改全表数据
        syncTableData(state, { tableData, total }) {
            return { ...state, tableData, total }
        },
        //.新增页签
        syncTaskPageInfo(state, { pageInfo }) {
            return { ...state, pageTaskInfo: { ...pageInfo } }
        },
        //.新增全表数据
        syncTableTiskData(state, { tableTaskData }) {
            return { ...state, tableTaskData }
        },
        //.历史记录页签
        syncHistoryPageInfo(state, { pageInfo }) {
            return { ...state, hisPageInfo: { ...pageInfo } }
        },
        //.历史记录数据
        syncHistoryTableData(state, { hisTableData, hisTotal }) {
            return { ...state, hisTableData, hisTotal }
        },
        //.执行历史记录页签
        syncHisExePageInfo(state, { pageInfo }) {
            return { ...state, hisExePageInfo: { ...pageInfo } }
        },
        //.执行历史记录数据
        syncHisExeTableData(state, { hisExeTableData }) {
            return { ...state, hisExeTableData }
        },
        //.查看执行历史记录页签
        syncHisExePageInfo(state, { pageInfo }) {
            return { ...state, hisExeWatchPageInfo: { ...pageInfo } }
        },
        //.查看执行历史记录数据
        syncHisExeWatchTableData(state, { hisExeWatchTableData }) {
            return { ...state, hisExeWatchTableData }
        },
        //.环境下拉框
        syncEnvData(state, { envOption }) {
            return { ...state, envOption }
        },
        //.系统下拉框
        syncSystemData(state, { systemOption }) {
            return { ...state, systemOption }
        },
    }
}