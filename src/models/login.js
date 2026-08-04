import { stringify } from 'querystring';
import { history } from 'umi';
import { fakeAccountLogin, login, logout } from '@/services/login';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import {message} from 'antd';
export const USER_TOKEN = 'USER_TOKEN';
const Model = {
  namespace: 'login',
  state: {
    status: undefined,
  },
  effects: {
    *Login({ payload, callback }, { call, put }) {
      if(payload.type){
        delete payload.type;
      };
      const response = yield call(login, payload);
      const {code, data} = response;
      if(code == '1'){
        message.success('登录成功')
        data?.userName && sessionStorage.setItem('username',data?.userName); 
        data && sessionStorage.setItem('userInfo', JSON.stringify(data));
        callback('success',data);
      }else {
        message.error('登录失败，请检查用户名和密码是否正确！')
      }
    },
    *Logout({payload,callback}, {select, call, put}){
        const res = yield call(logout);
        callback('success');
    },

    // logout() {
    //   const { redirect } = getPageQuery(); // Note: There may be security issues, please note
    //   if (window.location.pathname !== '/user/login' && !redirect) {
    //     history.replace({
    //       pathname: '/user/login',
    //       search: stringify({
    //         redirect: window.location.href,
    //       }),
    //     });
    //   }
    // },
  },
  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);
      return { ...state, status: payload.status, type: payload.type };
    },
  },
};
export default Model;
