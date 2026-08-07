import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Spin, Tabs } from 'antd';
import styles from './index.less';
import StepTree from './stepTree';
import HeaderBar from './headerBar';
import TitleContent from './titleContent';
import HttpRequestPage from './httpRequestPage';
import CommonVariables from './commonVariables';
import WaitControl from './waitControl';
import StepTreeDriven from './stepTreeDriven';
import DataDriven from './dataDriven';
import DetailDrawer from './headerBar/DetailDrawer';
import Empty from './dataDriven/Empty';
import utils from '../utils';
import CodePy from './codePy';
import { NodeTypeMap, NodeTypeReverseMap } from '@/pages/controller/common';
import StepDbOptions from './DbOptions';
import MessageCompare from './messageCompare';

const { TabPane } = Tabs;

const NewScript = (props) => {
    const {
        dispatch,
        scriptManagement: { selectedNode, caseInfo, commonVariable }
    } = props;

    const currentData = props?.location.query?.currentData ? JSON.parse(props?.location.query?.currentData) : {};
    const actionMode = props?.location?.query?.actionMode;

    const [globalLoading, setGlobalLoading] = useState(false);
    const [activeTabs, setActiveTabs] = useState('scriptStep'); //. 标签页面板回调
    const [refreshDebugLog, setRefreshDebugLog] = useState(false);

    useEffect(() => {
        handleInit();
    }, []);

    //. 初始化参数
    const handleInit = () => {

        //. 初始化当前选中节点
        dispatch({
            type: 'scriptManagement/syncSelectedNode',
            selectedNode: {}
        })

        //. 初始化响应信息
        dispatch({
            type: 'scriptManagement/syncResponseInfo',
            responseInfo: {}
        })

        //. 初始化单步骤中的jsonData
        dispatch({
            type: 'scriptManagement/syncJsonData',
            jsonData: {}
        })
        //. 初始化单步骤中的jsonData
        dispatch({
            type: 'scriptManagement/syncXmlData',
            xmlData: ''
        })

        //. 初始化配置选项
        dispatch({
            type: 'scriptManagement/GetConfigNames',
            params: {},
            callback: _ => { }
        });

        searchVariables();

        if (actionMode == 'edit') { //. 编辑
            dispatch({
                type: 'scriptManagement/StepTreeSearch',
                params: {
                    case_id: currentData?.case_id,
                    case_code: currentData?.case_code
                },
                nodeTypeReverseMap,
                callback: _ => {

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

            dispatch({
                type: 'scriptManagement/syncCommonVariable',
                commonVariable: []
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
            case_tags: currentData.case_tags ? transformTagData(currentData.case_tags) : [],
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

        dispatch({
            type: 'scriptManagement/syncCommonVariable',
            commonVariable: (commonVariable && commonVariable.length > 0) ? commonVariable : (Array.isArray(currentData?.session_variables) ? currentData?.session_variables : [])
        });

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
            <Spin style={{ width: '100%' }} spinning={globalLoading}>
                <div className="header-bar">
                    <HeaderBar
                        currentData={currentData}
                        actionMode={actionMode}
                        nodeTypeReverseMap={nodeTypeReverseMap}
                        onLoading={onLoading}
                        onRefreshDebugLog={setRefreshDebugLog}
                    />
                </div>
                <div className={styles['content']}>
                    <div className={styles['top-side']}>
                        <TitleContent
                            actionMode={actionMode}
                            currentData={currentData}
                            nodeTypeMap={nodeTypeMap}
                            nodeTypeReverseMap={nodeTypeReverseMap}
                        />
                    </div>

                    <Tabs tabBarStyle={{ paddingLeft: 60 }} defaultActiveKey="scriptStep" activeKey={activeTabs} onChange={e => setActiveTabs(e)} >
                        <TabPane tab="脚本步骤" key="scriptStep" >
                            <div className={styles['body-side']}>
                                <div className={styles['left-side']}>
                                    <StepTree
                                        nodeTypeMap={nodeTypeMap}
                                        nodeTypeReverseMap={nodeTypeReverseMap}
                                    // initialItems={initialItems}
                                    />
                                </div>
                                <div className={styles['right-side']}>
                                    {selectedNode.nodeType == 0 && (<CommonVariables currentData={currentData} actionMode={actionMode} />)}
                                    {(selectedNode.nodeType == 2) && (<HttpRequestPage onLoading={onLoading} />)}
                                    {(selectedNode.nodeType == 4) && (<HttpRequestPage onLoading={onLoading} />)}
                                    {selectedNode.nodeType == 3 && (<WaitControl />)}
                                    {selectedNode.nodeType == 5 && (<StepDbOptions />)}
                                    {selectedNode.nodeType == 6 && (<CodePy />)}
                                    {selectedNode.nodeType == 9 && (<MessageCompare />)}
                                </div>
                            </div>
                        </TabPane>

                        <TabPane tab="测试数据" key="dataDriven" >
                            <div className={styles['body-side']}>
                                <div className={styles['left-side']}>
                                    <StepTreeDriven
                                        nodeTypeMap={nodeTypeMap}
                                        nodeTypeReverseMap={nodeTypeReverseMap}
                                        onLoading={onLoading}
                                        activeTabs={activeTabs}
                                    />
                                </div>
                                <div className={styles['right-side']}>
                                    {((selectedNode.nodeType == 2||selectedNode.nodeType == 4) && !selectedNode.isQuote) ? (<DataDriven onLoading={onLoading} />) : (selectedNode.id && <Empty />)}
                                </div>
                            </div>
                        </TabPane>
                        <TabPane tab="调试记录" key="debugRecord" >
                            <DetailDrawer activeTabs={activeTabs} refreshDebugLog={refreshDebugLog} onRefreshDebugLog={setRefreshDebugLog} />
                        </TabPane>
                    </Tabs>
                </div>
            </Spin>
        </div>
    )
};

//.节点类型映射
const nodeTypeMap = { ...NodeTypeMap };

//. 节点类型 - 反向映射
const nodeTypeReverseMap = { ...NodeTypeReverseMap };

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(NewScript);