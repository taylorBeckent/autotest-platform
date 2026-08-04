import request from '@/utils/request';

//.AI问答
export function run(params){
    return request ('/ATPM/wxz/AIChat', {
        method: 'POST',
        requestType: 'form',
        data: params
    })
}
export function queryDeepSeek(params){
    return request ('/testPoint/deepseek/query', {
        method: 'POST',
        requestType: 'form',
        data: params
    })
}

//.查询执行机 /query-status no params
// export function run(params) {
//     return request('/ist/query-status', {
//         method: 'POST',
//         requestType: 'form',
//         data: params
//     })
// }