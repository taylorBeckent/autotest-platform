import { generateUUID } from '@/utils/utils';
import moment from 'moment';

const transformStepTreeData = (source, nodeTypeReverseMap, loopType, depth) => {
    // let depth = 0;
    let copyData = JSON.parse(JSON.stringify(source));
    if (copyData.length > 0) {
        copyData.map(item => {
            item['id'] = (loopType === 'copy' || loopType === 'copyScript') ? generateUUID() : item.step_id;
            item['nodeType'] = nodeTypeReverseMap[item.step_type];
            item['content'] = item.step_name;
            item['depth'] = depth;
            item['isHovered'] = false;
            item['isSelected'] = false;
            item['draggable'] = false;
            item['collapse'] = true;
            item['haveChild'] = item.step_type == "引用公共脚本/接口";
            item['childNode'] = [];
            if (item['request_body'] && typeof (item['request_body']) == 'object') {
                item['request_body'] = JSON.stringify(item['request_body'], null, 2);
            }
            //. 子节点
            if (item.children && item.children.length > 0) {
                // depth;
                item['childNode'] = transformStepTreeData(item.children, nodeTypeReverseMap, 'recursion', depth + 1);
            }

            //. 引用脚本节点
            if (loopType == 'quote' || item.quote_case_id) {
                item['isQuote'] = true; //. 节点打标记
            }

            //. 引用脚本下的节点
            if ((item.quote_steps && item.quote_steps.length > 0)) {
                // depth;
                let currentID = generateUUID();
                let varibaleObj = {
                    id: `item-fixed-${currentID}`,
                    step_id: `item-fixed-${currentID}`,
                    nodeType: 0,
                    step_type: '用户变量',
                    content: '用户变量',
                    step_name: '用户变量',
                    depth: 0,
                    isHovered: false,
                    isSelected: false,
                    draggable: false,
                    collapse: true,
                    haveChild: false,
                    childNode: [],
                    quote_steps: [],
                    isQuote: true,
                    session_variables: item?.quote_case?.session_variables
                };
                let quoteChildNode = [varibaleObj, ...item.quote_steps];

                item['isQuote'] = true; //. 节点打标记
                item['childNode'] = transformStepTreeData(quoteChildNode, nodeTypeReverseMap, 'quote', depth + 1);
            }
        });
    }

    if (loopType === 'first' || loopType === 'copyScript') {
        let varibaleObj = {
            id: 'item-fixed',
            nodeType: 0,
            step_type: '用户变量',
            content: '用户变量',
            step_name: '用户变量',
            depth: 0,
            isHovered: false,
            isSelected: false,
            draggable: false,
            collapse: true,
            haveChild: false,
            childNode: [],
            quote_steps: []
        };
        copyData.unshift(varibaleObj);
    }
    return copyData;
};

//. 遍历树结构并批量插入数据
const recurseTreeList = (treeList, insertList, selectedNode) => {
    if (!treeList || treeList.length == 0) return treeList;


    return treeList.map(item => {
        let copyItem = JSON.parse(JSON.stringify(item));

        if (copyItem.id == selectedNode.id) {
            insertList.map(each => {
                copyItem[`${each.insertKey}`] = each.insertValue;
            })
        }

        if (copyItem.childNode && copyItem.childNode.length > 0) {
            copyItem.childNode = recurseTreeList(copyItem.childNode, insertList, selectedNode);
        }
        return copyItem;
    })
};

//. 查找根节点有无相同名称的节点
const duplicateStepNameCheck = (treeList) => {
    let stepNameList = [];

    treeList.map(item => {
        if (item.step_type == "HTTP请求" || item.step_type == "数据库请求") {
            stepNameList.push(item.step_name);
        }
    })
    const duplicates = stepNameList.length > 0 ? stepNameList.filter((item, index) => stepNameList.indexOf(item) !== index) : [];
    return duplicates;
};

//. 查询是否有新增未保存的节点
const newStepCheck = (treeList) => {
    let stepNameList = [];
    treeList.map(item => {
        if (item.step_type == "HTTP请求" && !item.step_code) {
            stepNameList.push(item.content);
        }
    });
    return stepNameList;
};

//. 校验HTTP请求步骤是否有未填项
const stepValidateCheck = (treeList) => {
    let message = '';
    treeList.map((item, index) => {
        if (message.length > 0 || item.step_type !== 'HTTP请求') return;

        if (!item.content) {
            message += `第${index + 1}条步骤: 步骤名为空，请检查`;
            return;
        }

        if (!item.request_method) {
            message += `第${index + 1}条步骤: 请求方式未选择`;
            return;
        }

        if (!item.request_project_id) {
            message += `第${index + 1}条步骤: 目标应用未选择`;
            return;
        }

        if (!item.request_config_name) {
            message += `第${index + 1}条步骤: 配置名称未选择`;
            return;
        }

        if (!item.request_url) {
            message += `第${index + 1}条步骤: 请求路径未填写`;
            return;
        }
    })
    return message;
};

//. 时间排序
const sortByTimeAsc = (arr, order = 'asc') => {
    return arr.slice().sort((a, b) => {
        const timeA = a?.case_st_time ? moment(a.case_st_time).valueOf() : Infinity;
        const timeB = b?.case_st_time ? moment(b.case_st_time).valueOf() : Infinity;
        return order.toLocaleLowerCase() === 'desc' ? timeB - timeA : timeA - timeB;
    })
}

//. 按照batch_code进行解析聚合数据
const parseSearchHisTableData = (tableData) => {
    const data = tableData.reduce((acc, cur) => {
        if (cur.batch_code == null) {
            acc.push({
                key: generateUUID(),
                batch_code: cur.batch_code,
                case_name: cur.case_name,
                dataset_name: cur.dataset_name,
                screen_state: cur.case_state,
                screen_pass_ratio: cur.step_pass_ratio,
                involve_envs: cur.involve_envs,
                exec_name: '',
                case_st_time: cur.case_st_time,
                case_elapsed: cur.case_elapsed,
                // tip: cur.case_state === true ? '1/1' : '0/1',
                data: [cur],
            });
            return acc;
        }
        let target = acc.find(item => item.batch_code === cur.batch_code);
        if (!target) {
            target = {
                key: cur.batch_code,
                batch_code: cur.batch_code,
                case_name: cur.case_name,
                dataset_name: cur.dataset_name,
                screen_state: false,
                screen_pass_ratio: '',
                involve_envs: cur.involve_envs,
                exec_name: '',
                case_st_time: '',
                case_elapsed: 0,
                // tip: '0/0',
                data: [],
            };
            acc.push(target);
        }
        target.data.push(cur);
        target.data = sortByTimeAsc(target.data);
        target.case_st_time = target.data[0]?.case_st_time || null;
        target.screen_state = target.data.every(item => item.case_state === true);
        target.case_elapsed = target.data.reduce((sum, item) => sum + (Number.parseFloat(item.case_elapsed) || 0), 0).toFixed(2);
        const trueCount = target.data.filter(i => i.case_state === true).length;
        target.screen_pass_ratio = target.data.length > 0 ? (trueCount / target.data.length * 100).toFixed(2) + '%' : '0%';
        // target.tip =  trueCount + '/' + tableData.data.length;
        return acc;
    }, []);
    return data;
}

export default {
    transformStepTreeData,
    recurseTreeList,
    duplicateStepNameCheck,
    newStepCheck,
    parseSearchHisTableData,
    sortByTimeAsc,
    stepValidateCheck
}