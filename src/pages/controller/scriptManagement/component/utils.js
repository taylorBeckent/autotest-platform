import { NodeTypeReverseMap } from '@/pages/controller/common';
import formatXml from 'xml-formatter';

export function safeParse(data, options = {}) {
    const { fields = [], deep = true, } = options;

    const tryParse = (val) => {
        if (typeof val !== 'string') return val;
        if (/^\d{15,}$/.test(val)) {
            return val;
        }
        let result = val;
        let count = 0;
        const MAX_PARSE = 5;

       while (typeof result === 'string' && count < MAX_PARSE) {
            try {
                result = result.replaceAll('\\', '');
                result = JSON.parse(result, (_, value) => {
                    if (/^\d{15,}$/.test(value)) {
                        return String(value);
                    }
                    if (typeof value === 'number') {
                        return String(value);
                    }
                    return value;
                });
                count++;
            } catch(err) {
                break;
            }
       }
       return result;
    }

    const walk = (obj) => {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(walk);
        }
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => {
                if (fields.length === 0) {
                    return [key, tryParse(value)];
                }
                if (fields.includes(key)) {
                    return [key, tryParse(value)];
                }
                return [key, deep ? walk(tryParse(value)) : value];
            })
        );
    }
    return walk(data);
}

//  通过step_type判断选择的类型
// '用户变量': 0,
// '引用公共脚本/接口': 1,
// 'HTTP请求': 2,
// '等待控制': 3,
// 'TCP请求': 4,
// '数据库请求': 5,
// '代码请求(Python)': 6,
// '条件分支': 7,
// '循环结构': 8

export function parseStepType(selectStep) {
    const step_type = selectStep.step_type;

    return NodeTypeReverseMap[step_type];
}


export function parseStepEnv(item, stepType) {
    if ([2, 4].includes(stepType)) {
        return item.request_env_name;
    }
    if (stepType == 5) {
        const envs = item?.response_body?.map(item => item.env_name);
        return [...new Set(envs)].join(',');
    }
    return null;
}

export function parseStepReqUrl(item) {
    const regex = /[http|https]:\/\/[^\/]+([^?\s#]*)/;
    // 分解：  
    // - 请求地址:\s* → 匹配前缀（含可变空格）；  
    // - (?:http|https):// → 匹配协议（非捕获组）；  
    // - [^\/]+ → 匹配域名/端口（无斜杠）；  
    // - ([^?#]*) → 捕获组1（路径：除?/#外的所有字符）。 
    // const urlMatch = stepExecLogger.match(regex);
    const urlMatch = item?.match(regex);

    const url = urlMatch ? urlMatch[1] : '';
    const ipIdx = item?.indexOf(":") + 3;
    const endIdx = item?.indexOf('/', ipIdx);
    const ipStr = item?.slice(ipIdx, endIdx);
    const idx = ipStr?.indexOf(':');
    return { url: url, ip: ipStr?.slice(0, idx), port: ipStr?.slice(idx+1) };
}

export function parseDatabaseEnvInfo(item) {
    const stepType = parseStepType(item);
    if (stepType == 5) {
        const  rspBody = item.response_body ?? [];
        let rspEnvArray = {};
        for (const item of rspBody) {
            rspEnvArray[`${item.config_name}_${item.database_name}_${item.env_name}`] = 
                {
                    url: null,
                    ip: item.config_host,
                    port: item.config_port,
                    env: item.env_name,
                    database_name: item.database_name,
                    config_name: item.config_name,
                    status: Object.hasOwnProperty(item, 'error') ? false : true
                };
        }
        return rspEnvArray;
    }
    return {'undefined': { url: null, ip: null, port: null, env: null, status: false }};
}



export function formatXmlContent(xmlString) {
    try {
        const formatted = formatXml(xmlString, {
            indentation: '  ', // 2 空格缩进
            collapseContent: true,
            lineSeparator: '\n',
            whiteSpaceAtEndOfSelfclosingTag: true,
            stripComments: false,
        });
        return formatted;
    } catch (error) {
      console.log(`XML 格式错误: ${error.message}`);
      return xmlString;
    }
};