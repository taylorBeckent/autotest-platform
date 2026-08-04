import { message } from 'antd';
import { generateUUID } from '@/utils/utils';
import {
    queryTableData,
    querySystemList,
    addEnv,
    deleteEnv,
    updateEnv,
    queryEnvList,
    projectCreate,

    getAllApp,
    searchList,
    envAdd,
    envUpdate,
    appAdd,
    fileAdd,
    dbAdd,
    searchConfigList,
    appUpdate,
    fileUpdate,
    dbUpdate,
    configDelete,
    dbTestConnection,
    envDelete,
} from '../services';

export default {
    namespace: "envManagement",
    state: {
        tableData: [],//.表格总数据
        pageInfo: {
            current: 1,
            pageSize: 100,
        },
        total: 0,
        systemOption: [],//.所属系统下拉框

    },
    effects: {
        // .环境下拉框
        * QueryEnvList({ params, callback }, { call, put, select }) {
            const res = yield call(queryEnvList, {
                ...params
            });
            const { code, data } = res;
            if (code == '000000') {
                callback('success', data);
                // message.success(res.message);
            } else {
                callback('faild', {});
                message.error(res.message);
            }
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
        * QuerySystemList({ payload, callback }, { call, put, select }) {
            const res = yield call(querySystemList, {
                ...payload
            });
            const { code, data, status } = res;
            if (code == '000000') {
                yield put({
                    type: 'syncSystemOption',
                    systemOption: data,
                    // total: res.total
                })
                // callback('success');
                message.success(res.message);
            } else {
                // callback('faild');
                message.error(res.message);
            }
        },
        * AddEnv({ payload, callback }, { call, put, select }) {
            const res = yield call(addEnv, {
                ...payload
            });
            const { code, data, status } = res;
            if (code == '000000') {
                callback();
                message.success(res.message);
            } else {
                // callback('faild');
                message.error(res.message);
            }
        },
        * UpdateEnv({ payload, callback }, { call, put, select }) {
            const res = yield call(updateEnv, {
                ...payload
            });
            const { code, data, status } = res;
            if (code == '000000') {
                callback();
                message.success(res.message);
            } else {
                // callback('faild');
                message.error(res.message);
            }

        },
        * DeleteEnv({ payload, callback }, { call, put, select }) {
            const res = yield call(deleteEnv, {
                ...payload
            });
            const { code, data, status } = res;
            if (code == '000000') {
                callback();
                message.success(res.message);
            } else {
                // callback('faild');
                message.error(res.message);
            }
        },

        * ProjectCreate({ payload, callback }, { call, put, select }) {
            const res = yield call(projectCreate, {
                ...payload
            });
            const { code } = res;
            if (code == '000000') {
                callback('success');
                message.success(res.message);
            } else {
                callback('faild');
                message.error(res.message);
            }
        },


        //. 环境需求功能变更部分

        //. 应用查询
        * GetAllApp({ payload, callback }, { call, put }) {
            const res = yield call(getAllApp, {
                ...payload
            });
            const { code, data } = res;
            if (code == '000000') {
                yield put({
                    type: 'syncSystemOption',
                    systemOption: data,
                })
                message.success(res.message);
            } else {
                message.error(res.message);
            }
        },

        //. 环境查询 - 母表
        * SearchList({ payload, callback }, { call, put, select }) {
            const res = yield call(searchList, {
                ...payload
            });
            const { code, data } = res;
            if (code == '000000') {
                if (data.length > 0) {
                    data.map(item => {
                        item.detailVOList = {
                            childTotal: 0,
                            list: [],
                            childPageInfo: {
                                current: 1,
                                pageSize: 10,
                            },
                        };
                        item.uuid = generateUUID();
                    });
                }
                yield put({
                    type: 'syncTableData',
                    tableData: data,
                    total: res.total
                })
                callback('success');
                message.success(res.message);
            } else {
                callback('failed');
                message.error(res.message);
            }
        },

        //. 新增主表
        * EnvAdd({ payload, callback }, { call }) {
            const res = yield call(envAdd, {
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

        //. 新增编辑
        * EnvUpdate({ payload, callback }, { call }) {
            const res = yield call(envUpdate, {
                ...payload
            });
            const { code, data } = res;
            if (code == '000000') {
                callback('success');
                message.success(res.message);
            } else {
                callback('faild');
                message.error(res.message);
            }
        },

        //. 母表删除
        * EnvDelete({ payload, callback }, { call }) {
            const res = yield call(envDelete, { ...payload });
            const { code, data } = res;
            if (code == '000000') {
                callback('success');
                message.success(res.message);
            } else {
                callback('faild');
                message.error(res.message);
            }
        },

        //. 新增子表 - app
        * AppAdd({ payload, callback }, { call, put, select }) {
            const { tableData, total } = yield select(({ envManagement }) => envManagement);
            const res = yield call(appAdd, { ...payload });
            const { code, data } = res;
            if (code == '000000') {
                let newData = JSON.parse(JSON.stringify(tableData));
                newData.map(item => {
                    if (payload.env_info_id === item.project_id && payload.env === item.env_name && item.env_type === 1) {
                        item.is_delete = false;
                    }
                })
                yield put({
                    type: 'syncTableData',
                    tableData: newData,
                    total
                })
                callback('success');
                message.success(res.message);
            } else {
                callback('faild');
                message.error(res.message);
            }
        },

        //. 新增子表 - file
        * FileAdd({ payload, callback }, { call, put, select }) {
            const { tableData, total } = yield select(({ envManagement }) => envManagement);
            const res = yield call(fileAdd, { ...payload });
            const { code, data } = res;
            if (code == '000000') {
                let newData = JSON.parse(JSON.stringify(tableData));
                newData.map(item => {
                    if (payload.env_info_id === item.project_id && payload.env === item.env_name && item.env_type === 2) {
                        item.is_delete = false;
                    }
                })
                yield put({
                    type: 'syncTableData',
                    tableData: newData,
                    total
                })
                callback('success');
                message.success(res.message);
            } else {
                callback('faild');
                message.error(res.message);
            }
        },

        //. 新增子表 - db
        * DbAdd({ payload, callback }, { call, put, select }) {
            const { tableData, total } = yield select(({ envManagement }) => envManagement);
            const res = yield call(dbAdd, { ...payload });
            const { code, data } = res;
            if (code == '000000') {
                let newData = JSON.parse(JSON.stringify(tableData));
                newData.map(item => {
                    if (payload.env_info_id === item.project_id && payload.env === item.env_name && item.env_type === 3) {
                        item.is_delete = false;
                    }
                })
                yield put({
                    type: 'syncTableData',
                    tableData: newData,
                    total
                })
                callback('success');
                message.success(res.message);
            } else {
                callback('faild');
                message.error(res.message);
            }
        },

        //. 查询子表
        * SearchConfigList({ payload, childPageInfo, callback }, { call, put, select }) {
            const { tableData, total } = yield select(({ envManagement }) => envManagement);
            const res = yield call(searchConfigList, {
                ...payload
            });
            const { code, data } = res;
            if (code == '000000') {
                let newData = JSON.parse(JSON.stringify(tableData));
                newData.map(item => {
                    if (payload.env_info_id === item.project_id && payload.env_name === item.env_name && payload.env_type === item.env_type) {
                        item.detailVOList.childTotal = res.total;
                        item.detailVOList.list = data;
                        item.detailVOList.childPageInfo = {
                            current: childPageInfo.current,
                            pageSize: childPageInfo.pageSize,
                        }
                        res.total === 0 && (item.is_delete = true)
                    }
                })
                yield put({
                    type: 'syncTableData',
                    tableData: newData,
                    total
                })
                callback('success');
                message.success(res.message);
            } else {
                callback('faild');
                message.error(res.message);
            }
        },

        //. 修改子表页签
        *ChildPageChange({ payload, currentPageInfo }, { select, put }) {
            const { tableData } = yield select(({ envManagement }) => envManagement);
            let newData = JSON.parse(JSON.stringify(tableData));
            newData.map(item => {
                if (payload.id == item.id && payload.project_id == item.project_id && payload.env_name == item.env_name && payload.env_type == item.env_type) {
                    item.detailVOList.childPageInfo = currentPageInfo
                }
            });
            yield put({
                type: 'syncTableData',
                tableData: newData
            })
        },

        //. 修改子表 - app
        * AppUpdate({ payload, callback }, { call, put }) {
            const res = yield call(appUpdate, { ...payload });
            const { code, data } = res;
            if (code == '000000') {
                callback('success');
                message.success(res.message);
            } else {
                callback('faild');
                message.error(res.message);
            }
        },

        //. 修改子表 - file
        * FileUpdate({ payload, callback }, { call, put }) {
            const res = yield call(fileUpdate, { ...payload });
            const { code, data } = res;
            if (code == '000000') {
                callback('success');
                message.success(res.message);
            } else {
                callback('faild');
                message.error(res.message);
            }
        },

        //. 修改子表 - db
        * DbUpdate({ payload, callback }, { call, put }) {
            const res = yield call(dbUpdate, { ...payload });
            const { code, data } = res;
            if (code == '000000') {
                callback('success');
                message.success(res.message);
            } else {
                callback('faild');
                message.error(res.message);
            }
        },

        //. 删除子表
        * ConfigDelete({ payload, callback }, { call, put }) {
            const res = yield call(configDelete, { ...payload });
            const { code, data } = res;
            if (code == '000000') {
                callback('success');
                message.success(res.message);
            } else {
                callback('faild');
                message.error(res.message);
            }
        },

        //. 删除子表
        * DbTestConnection({ payload, callback }, { call, put }) {
            const res = yield call(dbTestConnection, { ...payload });
            const { code, data } = res;
            if (code == '000000') {
                callback('success');
                message.success(res.message);
            } else {
                callback('faild');
                message.error(res.message);
            }
        },
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
        syncSystemOption(state, { systemOption, total }) {
            return { ...state, systemOption, total }
        },

    }
}