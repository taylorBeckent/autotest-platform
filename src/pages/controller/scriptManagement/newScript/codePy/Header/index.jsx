import React from 'react';
import { Input, Row, Col } from 'antd';
import { connect } from 'umi';
import { useNodeField } from '@/pages/controller/hooks/useNodeField';

const HeaderCodePy = (props) => {
    const {
        dispatch,
        scriptManagement: { selectedNode, stepTreeList, envNameList, envListSingle, applicationList, commonVariable }
    } = props;

    const [requestName, requestNameChange] = useNodeField(
        {
            dispatch,
            selectedNode,
            fieldKey: 'content',
            extrakeys: [{ key: 'step_name' }],
            stepTreeList
        }
    ); //. 脚本名称

    // const [targetProjectId, setTargetProjectId] = useState(); //. 所属系统value
    // const [requestName, setRequestName] = useState(); //. 脚本名称
    // console.log('Select  selectNode: ', selectedNode);
    // console.log('Select  stepTreeList: ', stepTreeList);
    // useEffect(() => {
    //     selectedNode?.content ? setRequestName(selectedNode?.content) : setRequestName();
    //     selectedNode?.request_project_id ? setTargetProjectId(selectedNode?.request_project_id) : setTargetProjectId();
    // }, [selectedNode]);

    // //. 步骤名称change
    // const requestNameChange = (e) => {
    //     setRequestName(e.target.value);

    //     let insertList = [
    //         { insertKey: 'content', insertValue: e.target.value },
    //         { insertKey: 'step_name', insertValue: e.target.value }
    //     ];
    //     updateTreeList(insertList);

    //     selectedNode['content'] = e.target.value;
    //     selectedNode['step_name'] = e.target.value;
    //     dispatch({
    //         type: 'scriptManagement/syncSelectedNode',
    //         selectedNode: { ...selectedNode, content: e.target.value, step_name: e.target.value }
    //     })
    // };

    // const updateTreeList = (insertList) => {
    //     let finalList = utils.recurseTreeList(stepTreeList, insertList, selectedNode);

    //     dispatch({
    //         type: 'scriptManagement/syncStepTreeList',
    //         stepTreeList: finalList
    //     });
    // };

    return (
        <div style={{ padding: 10, border: '1px solid #e5e7ee', borderLeft: '5px solid #409eff', borderRadius: 15 }}>
            <Row style={{ alignItems: 'center' }} >
                <Col span={2} style={{ textAlign: 'center' }}>
                    <label>名称：</label>
                </Col>
                <Col span={22}>
                    <Input
                        style={{ borderRadius: 6 }}
                        placeholder="请输入名称"
                        value={requestName}
                        onChange={requestNameChange}
                        disabled={selectedNode?.isQuote}
                    />
                </Col>
            </Row>
        </div>
    )
};

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(HeaderCodePy);