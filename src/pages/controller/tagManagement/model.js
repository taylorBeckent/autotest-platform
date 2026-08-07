import {
    tagSearch,
    tagCreate,
    tagUpdate,
    tagDelete
} from './services';
import { message } from 'antd';

export default {
    namespace: 'tagManagement',
    state: {
        tableData: [],
        total: 0,
        pageInfo: {
            current: 1,
            pageSize: 10
        },
    },
    effects: {
        *TagTableSearch({ params, callback }, { call, put }) {
            const res = yield call(tagSearch, {
                ...params
            });
            const { code, data } = res;
            if (code === '000000') {
                yield put({
                    type: 'syncTableData',
                    tableData: data
                })

                yield put({
                    type: 'syncTotal',
                    total: res.total
                })
            } else {
                yield put({
                    type: 'syncTableData',
                    tableData: []
                })

                yield put({
                    type: 'syncTotal',
                    total: 0
                })
                message.error(res?.message);
            }
            callback();
        },

        *ClassifyTagSearch({ params, callback }, { call, put }) {
            const res = yield call(tagSearch, {
                ...params
            });
            const { code, data } = res;
            if (code === '000000') {
                // message.success(res.message);
                callback('success', data);
            } else {
                message.error(res?.message);
                callback('failed', []);
            }
        },

        *TagCreate({ params, callback }, { call, put }) {
            const res = yield call(tagCreate, params);
            const { code, data } = res;
            if (code === '000000') {
                // message.success(res.message);
                callback('success');
            } else {
                message.error(res.message);
                callback('failed');
            }
        },

        *TagUpdate({ params, callback }, { call, put }) {
            const res = yield call(tagUpdate, params);
            const { code, data } = res;
            if (code === '000000') {
                // message.success(res.message);
                callback('success');
            } else {
                message.error(res.message);
                callback('failed');
            }
        },

        *TagDelete({ params, callback }, { call, put }) {
            const res = yield call(tagDelete, params);
            const { code, data } = res;
            if (code === '000000') {
                // message.success(res.message);
                callback('success');
            } else {
                message.error(res.message);
                callback('failed');
            }
        },
    },
    reducers: {
        syncTableData(state, { tableData }) {
            return { ...state, tableData };
        },
        syncPageInfo(state, { pageInfo }) {
            return { ...state, pageInfo: { ...pageInfo } };
        },
        syncTotal(state, { total }) {
            return { ...state, total };
        }
    }
}