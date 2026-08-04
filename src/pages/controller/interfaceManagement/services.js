import request from '@/utils/request';

//. HTTP请求单步调试
export function httpDebugging(params) {
    return request('/database/yk/autotest/step/http_debugging', {
        method: 'POST',
        data: params
    })
}
//. TCP请求单步调试
export function tcpDebugging(params) {
    return request('/database/yk/autotest/step/tcp_debugging', {
        method: 'POST',
        data: params
    })
}

//. HTTP请求全量调试
export function executeOrDebugging(params) {
    return request('/database/yk/autotest/step/execute_or_debugging', {
        method: 'POST',
        data: params
    })
}

//. 脚本编辑页面 - 保存/新增
export function updateOrCreateTree(params) {
    return request('/database/yk/autotest/step/update_or_create_tree', {
        method: 'POST',
        data: params
    })
}