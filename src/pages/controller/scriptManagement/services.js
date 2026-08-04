import request from '@/utils/request';
import { stringify } from 'qs';

//.查询抽屉历史表格数据
export function queryHistoryTableData(params) {
    return request('database/zzt/autoapitool/report/search', {
        // return request('/esb/logs_query', {
        method: 'POST',
        // requestType: 'form',
        data: params,
    });
};
//.查询抽屉历史查看表格数据
export function queryHistoryDetailTableData(params) {
    return request('database/yk/autotest/detail/search', {
        // return request('/esb/logs_query', {
        method: 'POST',
        // requestType: 'form',
        data: params,
    });
};

//. 查询应用
export function projectSearch(params) {
    return request('/database/yk/autotest/project/search', {
        method: 'POST',
        data: params
    })
};

//. 查询可用应用-已完成配置后应用
export function getEffectiveApp(params) {
    return request('/database/yk/autotest/project/search', {
        method: 'POST',
        data: params
    })
};


//. 应用查询
export function queryEnvApps(params) {
    return request(`database/lxd/getallApp?${stringify(params)}`, {
        method: 'GET',
        data: params,
    });
};

// 
export function queryEnvAppsChildConfig(params) {
    return request(`database/lxd/config/list?${stringify(params)}`, {
        method: 'GET',
        data: params,
    });
};

// 根据project_id查询
export function queryEnvAppsWithProjectId(params) {
    return request(`database/lxd/search/list?${stringify(params)}`, {
        method: 'GET',
        data: params,
    })
}

//. 查询标签
export function tagSearch(params) {
    return request('/database/yk/autotest/tag/search', {
        method: 'POST',
        data: params
    })
};

//. 查询脚本
export function caseSearch(params) {
    return request('/database/yk/autotest/case/search', {
        method: 'POST',
        data: params
    })
};

//. 删除脚本
export function caseDelete(params) {
    return request(`/database/yk/autotest/case/delete?${stringify(params)}`, {
        method: 'DELETE',
        // requestType: 'form',
        data: params,
    })
}

//. 步骤树查询
export function stepTreeSearch(params) {
    return request(`/database/yk/autotest/step/tree?${stringify(params)}`, {
        method: 'GET',
        data: params
    })
}

//. 步骤树查询 - 复制
export function stepCopyTreeSearch(params) {
    return request(`/database/yk/autotest/step/copy_tree?${stringify(params)}`, {
        method: 'GET',
        data: params
    })
}

//. 环境查询
export function envSearch(params) {
    return request(`/database/yk/autotest/env/search`, {
        method: 'POST',
        data: params
    })
}

//. 环境查询 -- 新接口（去重）
export function getEnvNames(params) {
    // return request(`/database/yk/autotest/env/get_env_names?${stringify(params)}`, {
    return request(`/database/lxd/list`, {
        method: 'POST',
        data: params
    })
}

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
//.执行环境选择
export function queryEnv(params) {
    return request('/database/zzt/autoapitool/env/get_env_names', {
        method: 'GET',
        data: params
    })
}

//. 查询场景名称
export function queryNames(params) {
    return request('/database/lb/autotest/query-names', {
        method: 'POST',
        requestType: 'form',
        data: params
    })
}

//. 测试用例生成后的数据-查询
export function queryCreate(params) {
    return request('/database/lb/autotest/query-create', {
        method: 'POST',
        requestType: 'form',
        data: params
    })
}

//. 测试用例生成后的数据-删除
export function deleteCreate(params) {
    return request('/database/lb/autotest/delete-create', {
        method: 'POST',
        requestType: 'form',
        data: params
    })
}

//. 测试用例生成
export function uploadCreate(params) {
    return request('/database/lb/autotest/upload-create', {
        method: 'POST',
        requestType: 'form',
        data: params
    })
}

//. 变量函数查询
export function sessionVariables(params) {
    return request(`/database/zzt/autoapitool/case/session_variables?${stringify(params)}`, {
        method: 'GET',
        data: params
    })
}

//. 数据驱动文件删除
export function deleteSource(params) {
    return request('/database/lb/autotest/delete-source', {
        method: 'POST',
        requestType: 'form',
        data: params
    })
}

//. 查询全量配置
export function getConfigNames(params) {
    return request(`/database/yk/autotest/env/get_config_names?${stringify(params)}`, {
        method: 'GET',
        requestType: 'form',
        data: params
    })
}

//. 查询指定应用列表下的ip/port信息
export function envQuery(params) {
    return request('/database/yk/autotest/env/query', {
        method: 'POST',
        data: params
    })
}