
import { run ,queryDeepSeek } from '@/services/aiQuest';

import { message } from 'antd';

export default {
    namespace: 'aiQuest',
    state: {
        messageList: [],
    },
    effects: {
       
        *Run({ payload, callback }, { call, put }) {
            const res = yield call(run, payload);
            // const { code, data } = res;
            if (res.retCd === '000000') {
                // yield put({
                //     type: 'syncPid',
                //     pid: data?.pid
                // })
                message.success(res?.retMsg);
                callback(res.data);
            } else {
                message.error(res?.retMsg);
            }
           
        },
        *QueryDeepSeek({ payload, callback }, { call, put }) {
            const res = yield call(queryDeepSeek, payload);
            // const { code, data } = res;
            if (res.retCd === '000000') {
                // yield put({
                //     type: 'syncPid',
                //     pid: data?.pid
                // })
                message.success(res?.retMsg);
                callback(res.data);
            } else {
                message.error(res?.retMsg);
            }
           
        }
    },
    reducers: {
        syncMessageList(state, { messageList }) {
            return { ...state, messageList };
        }
    }
}