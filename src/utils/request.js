/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { notification } from 'antd';

const codeMessage = {
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误）。',
    403: '用户得到授权，但是访问是被禁止的。',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
};
/**
 * 异常处理程序
 */

const errorHandler = error => {
    const { response } = error;
    if (response && response.status) {
        const errorText = codeMessage[response.status] || response.statusText;
        const { status, url } = response;
        notification.error({
            message: `请求错误 ${status}: ${url}`,
            description: errorText,
        });
    } else if (!response) {
        notification.error({
            description: '您的网络发生异常，无法连接服务器',
            message: '网络异常',
        });
    }

    return response;
};
/**
 * 配置request请求时的默认参数
 */

const request = extend({
    errorHandler,
    // 默认错误处理
    credentials: 'include', // 默认请求是否带上cookie
});

request.interceptors.request.use((url, options) => {
    // console.log('url:',url);///API/yhj/CB/customer/transaction/query/info/
    if (url == '/API/yhj/CB/delete/status_word/cancle/' || url == '/API/yhj/CB/insert/status_word/') {
        const headers = {
            version: `django-insecure-t-&)oxy@7kh+d1k)m3+fune&2)i5jjk@l!#$q=*29^7#w25td0`
        }
        return {
            url,
            options: { ...options, headers }
        }
    }

    options.headers = {
        ...options.headers,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwicGFzc3dvcmQiOm51bGwsImFsaWFzIjpudWxsLCJlbWFpbCI6bnVsbCwicGhvbmUiOm51bGwsImF2YXRhciI6bnVsbCwic3RhdGUiOjAsImlzX2FjdGl2ZSI6bnVsbCwiaXNfc3VwZXJ1c2VyIjp0cnVlLCJsYXN0X2xvZ2luIjpudWxsLCJhY2Nlc3NfdG9rZW4iOm51bGwsImV4cCI6MTgxNzQzMzM5NCwidG9rZW5fdmVyc2lvbiI6MH0.k6ue_ZpEvsaDx9LrBHjDTaSpzS0dfGPsZif3r4ArK2Y'
    }

    return { url, options }
})
// 修改路由拦截
// function request(path,options={}) {
//   const defaultOptions={
//     header:{},
//     credentials: 'include',
//   }
//   const token=sessionStorage.getItem(USER_TOKEN)
//   if(token){
//     defaultOptions.headers.Authorization=`Bearer ${token}`
//   }
//   return umiRequest(path,{
//     ...defaultOptions,
//     ...options
//   })
// }
// const umiRes=extend({
//   errorHandler,
//   credentials: 'include',
// })
// umiRes.interceptors.response.use(async response=>{
//   if(response.url.indexOf('logout')!=='-1'){
//     window.location.href('/user/login')
//   }
//   return response
// })
export default request;
