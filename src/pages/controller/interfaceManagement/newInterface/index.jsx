import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import styles from './index.less';
import HeaderBar from './headerBar';
import TitleContent from './titleContent';
import HttpRequestPage from './httpRequestPage';
import utils from '../../scriptManagement/utils';
import { NodeTypeMap, NodeTypeReverseMap } from '@/pages/controller/common';

const NewInterface = (props) => {
    const {
        dispatch,
        scriptManagement: { caseInfo }
    } = props;

    const currentData = props?.location.query?.currentData ? JSON.parse(props?.location.query?.currentData) : {};
    const actionMode = props?.location?.query?.actionMode;

    const [globalLoading, setGlobalLoading] = useState(false);

    useEffect(() => {
        handleInit();
    }, []);

    //. 初始化参数
    const handleInit = () => {
        //. 初始化响应信息
        dispatch({
            type: 'scriptManagement/syncResponseInfo',
            responseInfo: {}
        })

        //. 初始化单步骤中的jsonData
        dispatch({
            type: 'interfaceManagement/syncJsonData',
            jsonData: {}
        })
        //. 初始化单步骤中的xmlData
        dispatch({
            type: 'interfaceManagement/syncXmlData',
            xmlData: ''
        })

        //. 初始化配置选项
        dispatch({
            type: 'scriptManagement/GetConfigNames',
            params: {},
            callback: _ => { }
        });

        if (actionMode == 'edit') { //. 编辑
            dispatch({
                type: 'scriptManagement/StepTreeSearch',
                params: {
                    case_id: currentData?.case_id,
                    case_code: currentData?.case_code
                },
                nodeTypeReverseMap,
                callback: (flag, stepTreeList) => {
                   
                    if (flag == 'success' && stepTreeList.length > 1 && stepTreeList[1]?.step_id) {
                        dispatch({
                            type: 'interfaceManagement/syncInterfaceInfo',
                            interfaceInfo: {
                                ...stepTreeList[1],
                                request_body: (stepTreeList[1]['request_body'] && typeof (stepTreeList[1]['request_body']) == 'object') ? JSON.stringify(stepTreeList[1]['request_body'], null, 2) : stepTreeList[1]['request_body']
                            }
                        })
                    }
                }
            })
            initializedCaseInfo();
        } else if (actionMode == 'copy') { //. 复制
            initializedCaseInfo();
        } else {
            let finalData = utils.transformStepTreeData([], nodeTypeReverseMap, 'first', 0);
            dispatch({
                type: 'scriptManagement/syncStepTreeList',
                stepTreeList: finalData
            })

            //. 初始化用例信息
            dispatch({
                type: 'scriptManagement/syncCaseInfo',
                caseInfo: []
            })
        }
    };

    //. 初始化存储
    const initializedCaseInfo = () => {
        let initCaseInfo = {
            ...caseInfo,
            case_id: currentData?.case_id,
            case_code: currentData?.case_code,
            case_name: currentData?.case_name,
            case_tags: [],
            // case_tags: currentData.case_tags ? transformTagData(currentData.case_tags) : [],
            case_attr: currentData?.case_attr,
            case_project: currentData?.case_project?.project_id,
            case_type: currentData?.case_type,
            case_desc: currentData?.case_desc,
            session_variables: currentData?.session_variables
        }

        dispatch({
            type: 'scriptManagement/syncCaseInfo',
            caseInfo: initCaseInfo
        })

        searchVariables(currentData?.case_id, currentData?.case_code);
    };

    //. 查询函数变量
    const searchVariables = (case_id, case_code) => {
        dispatch({
            type: 'scriptManagement/SessionVariables',
            params: {},
            callback: _ => { }
        })
    };

    //. 数据格式转换
    const transformTagData = (sourceData) => {
        let finalArr = [];
        sourceData.map(item => {
            let arr = [];
            arr.push(item.tag_mode);
            arr.push(item.tag_id);
            finalArr.push(arr);
        });
        return finalArr;
    };

    const onLoading = (loadingStatus) => {
        if (loadingStatus === 'loading') {
            setGlobalLoading(true);
        } else {
            setGlobalLoading(false);
        }
    };

    return (
        <div className={styles['wrapper']}>
            <Spin style={{ width: '100%' }} spinning={globalLoading} >
                <div className={styles['header-bar']}>
                    <HeaderBar
                        currentData={currentData}
                        actionMode={actionMode}
                        nodeTypeReverseMap={nodeTypeReverseMap}
                        onLoading={onLoading}
                    />
                </div>
                <div className={styles['content']}>
                    <div className={styles['top-side']}>
                        <TitleContent
                            currentData={currentData}
                            actionMode={actionMode}
                            nodeTypeMap={nodeTypeMap}
                            nodeTypeReverseMap={nodeTypeReverseMap}
                        />
                    </div>
                    <div className={styles['body-side']}>
                        <HttpRequestPage onLoading={onLoading} />
                    </div>
                </div>
            </Spin>
        </div>
    )
};

//.节点类型映射
const nodeTypeMap = { ...NodeTypeMap };
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
const nodeTypeReverseMap = { ...NodeTypeReverseMap };
// const nodeTypeReverseMap = {
//     '用户变量': 0,
//     '引用脚本': 1,
//     'HTTP请求': 2,
//     '等待控制': 3,
//     '引用公共用例': 4,
//     'TCP请求': 5,
//     '数据库请求': 6,
//     '代码请求(Python)': 7,
//     '条件分支': 8,
//     '循环结构': 9
// }

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(NewInterface);