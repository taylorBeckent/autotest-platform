import request from '@/utils/request';

//.查询表格数据
export function queryTableData(params) {
    return request('database/zzt/autoapitool/task/search', {
        // return request('/esb/logs_query', {
        method: 'POST',
        // requestType: 'form',
        data: params,
    });
};
//.删除表格数据
export function deleteTable(params) {
    return request('database/zzt/autoapitool/task/delete', {
        // return request('/esb/logs_query', {
        method: 'DELETE',
        // requestType: 'form',
        params: params,
    });
};

//.查询新增表格数据
export function queryTiskTableData(params) {
    return request('API/yk/acl-selectEsbMsg/', {
        // return request('/esb/logs_query', {
        method: 'POST',
        // requestType: 'form',
        data: params,
    });
};
//.查询历史记录表格数据
export function queryHistoryTableData(params) {
    return request('database/zzt/autoapitool/report/task_case_statistics', {
        // return request('/esb/logs_query', {
        method: 'GET',
        // requestType: 'form',
        params: params,
    });
};
//.历史记录查看表格数据
export function queryExeTaskTableData(params) {
    return request('database/zzt/autoapitool/report/byBatchCode', {
        // return request('/esb/logs_query', {
        method: 'POST',
        // requestType: 'form',
        data: params,
    });
};
//.新增
export function create(params) {
    return request('database/zzt/autoapitool/task/create', {
        // return request('/esb/logs_query', {
        method: 'POST',
        // requestType: 'form',
        data: params,
    });
};

//.查询所属系统
export function querySystemList(params) {
    return request('database/yk/autotest/project/search', {
        // return request('/esb/logs_query', {
        method: 'POST',
        // requestType: 'form',
        data: params,
    });
};

//.查询环境
export function queryEnvList(params) {
    return request('database/yk/autotest/env/search', {
        // return request('/esb/logs_query', {
        method: 'POST',
        // requestType: 'form',
        data: params,
    });
};
//.表格编辑查询详细数据
export function queryDetailTaskList(params) {
    return request('database/zzt/autoapitool/task/get', {
        // return request('/esb/logs_query', {
        method: 'GET',
        // requestType: 'form',
        params: params,
    });
};
//.表格编辑保存数据
export function saveEditTable(params) {
    return request('database/zzt/autoapitool/task/update', {
        // return request('/esb/logs_query', {
        method: 'POST',
        // requestType: 'form',
        data: params,
    });
};
//.表格编辑保存数据
export function executeTable(params) {
    return request('database/zzt/autoapitool/task/task_execute', {
        // return request('/esb/logs_query', {
        method: 'POST',
        // requestType: 'form',
        data: params,
    });
};