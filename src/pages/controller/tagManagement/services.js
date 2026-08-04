import request from '@/utils/request';
import {stringify} from 'qs';

//. 查询标签
export function tagSearch(params) {
    return request('/database/yk/autotest/tag/search', {
        method: 'POST',
        data: params
    })
};

//. 新增标签
export function tagCreate(params) {
    return request('/database/yk/autotest/tag/create', {
        method: 'POST',
        data: params
    })
};

//. 更新标签
export function tagUpdate(params) {
    return request('/database/yk/autotest/tag/update', {
        method: 'POST',
        data: params
    })
};

//. 删除标签
export function tagDelete(params) {
    return request(`/database/yk/autotest/tag/delete?${stringify(params)}`, {
        method: 'DELETE',
        data: params
    })
};