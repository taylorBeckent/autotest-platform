import request from '@/utils/request';
import axios from 'axios';

export async function fakeAccountLogin(params) {
  return request('/api/login/account', {
    method: 'POST',
    data: params,
  });
}
export async function getFakeCaptcha(mobile) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}

//.登录接口
export async function login(params) {
  // return await axios('/api/login/userLogin',{
  //   method: 'POST',
  //   params,
  // })
  return request('/api/login', {
    method: 'POST',
    data:params,
    requestType: 'form',
  });
}

//.登出
export function logout () {
  return request('/api/logout',{
      method: 'GET',
  })
}