import request from '@/utils/request';
import { stringify } from 'qs';

//.查询表格数据
export function queryTableData(params) {
    return request('database/yk/autotest/env/search', {
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
//.新增环境
export function addEnv(params) {
    return request('database/yk/autotest/env/create', {
        // return request('/esb/logs_query', {
        method: 'POST',
        // requestType: 'form',
        data: params,
    });
};
//.删除环境
export function deleteEnv(params) {
    return request('database/yk/autotest/env/delete', {
        // return request('/esb/logs_query', {
        method: 'DELETE',
        // requestType: 'form',
        params: params,
    });
};
//.修改环境
export function updateEnv(params) {
    return request('database/yk/autotest/env/update', {
        // return request('/esb/logs_query', {
        method: 'POST',
        // requestType: 'form',
        data: params,
    });
};

//.查询环境下拉框
export function queryEnvList(params) {
    // return request('database/zzt/autoapitool/env/get_env_names', {
    return request(`/database/yk/autotest/env/list`, {
        method: 'POST',
        data: params,
    });
};

//.新增系统
export function projectCreate(params) {
    return request('database/yk/autotest/project/create', {
        method: 'POST',
        // requestType: 'form',
        data: params,
    });
};


//. 环境需求功能改造 - 新接口

//. 应用查询
export function getAllApp(params) {
    return request(`database/yk/autotest/env/get_all_app?${stringify(params)}`, {
        method: 'GET',
        data: params,
    });
};

//. 环境查询 - 母表
export function searchList(params) {
    return request(`database//yk/autotest/env/page?${stringify(params)}`, {
        method: 'GET',
        data: params,
    });
};

//. 环境新增 - 母表
export function envAdd(params) {
    return request('database/yk/autotest/env/create', {
        method: 'POST',
        data: params,
    });
};

//. 环境编辑 - 母表
export function envUpdate(params) {
    return request('database/yk/autotest/env/update', {
        method: 'POST',
        data: params,
    });
};

//. 环境删除 - 母表
export function envDelete(params) {
    return request('database/yk/autotest/env/delete', {
        method: 'POST',
        data: params,
    });
};

//. 新增子表 - APP
export function appAdd(params) {
    return request('database/yk/autotest/config/app/create', {
        method: 'POST',
        data: params,
    });
};

//. 新增子表 - File
export function fileAdd(params) {
    return request('database/yk/autotest/config/file/create', {
        method: 'POST',
        data: params,
    });
};

//. 新增子表 - DB
export function dbAdd(params) {
    return request('database/yk/autotest/config/database/create', {
        method: 'POST',
        data: params,
    });
};

//. 子表查询
export function searchConfigList(params) {
    return request(`database//yk/autotest/config/list?${stringify(params)}`, {
        method: 'GET',
        data: params,
    });
};

//. 编辑子表 - APP
export function appUpdate(params) {
    return request('database/yk/autotest/config/app/update', {
        method: 'POST',
        data: params,
    });
};

//. 编辑子表 - File
export function fileUpdate(params) {
    return request('database/yk/autotest/config/file/update', {
        method: 'POST',
        data: params,
    });
};

//. 编辑子表 - DB
export function dbUpdate(params) {
    return request('database/yk/autotest/config/db/update', {
        method: 'POST',
        data: params,
    });
};

//. 删除子表
export function configDelete(params) {
    return request('database/yk/autotest/config/delete', {
        method: 'POST',
        data: params,
    });
};

//. 数据库连接测试
export function dbTestConnection(params) {
    return request('database/yk/autotest/config/database/test_connection', {
        method: 'POST',
        data: params,
    });
};