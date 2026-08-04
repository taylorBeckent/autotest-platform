export const SourceOption = [
    'Response Text',
    'Response Json',
    'Response XML',
    'Response Headers',
    'Response Cookie',
    '变量池'
];

export const AssertType = [
    '等于',
    '大于',
    '大于等于',
    '小于',
    '小于等于',
    '不等于',
    '长度等于',
    '包含',
    '不包含',
    // '在...内',
    '以...开始',
    '以...结束',
    // '正则',
    // '类型等于'
];

//.节点类型映射
export const NodeTypeMap = {
    0: '用户变量',
    1: '引用公共脚本/接口',
    2: 'HTTP请求',
    3: '等待控制',
    4: 'TCP请求',
    5: '数据库请求',
    6: '代码请求(Python)',
    7: '条件分支',
    8: '循环结构',
    9: '报文比对'
};

// const nodeTypeMap = {
//     0: '用户变量',
//     1: '引用脚本',
//     2: 'HTTP请求',
//     3: '等待控制',
//     4: '引用公共用例',
//     5: 'TCP请求',
//     6: '数据库请求',
//     7: '代码请求(Python)',
//     8: '条件分支',
//     9: '循环结构',
// };

//. 节点类型 - 反向映射
export const NodeTypeReverseMap = {
    '用户变量': 0,
    '引用公共脚本/接口': 1,
    'HTTP请求': 2,
    '等待控制': 3,
    'TCP请求': 4,
    '数据库请求': 5,
    '代码请求(Python)': 6,
    '条件分支': 7,
    '循环结构': 8,
    '报文比对': 9
};


// 数据库操作字段
export const databaseFieldMust = ['project_id', 'config_name', 'database_name', 'expr'];
export const databaseFieldMustObj = {
    project_id: '应用',
    config_name: '配置名',
    database_name: '数据库名',
    expr: 'SQL语句',
    variable_name: '变量名'
};