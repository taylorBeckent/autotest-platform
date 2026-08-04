import React from 'react';
import { Input, Row, Col, Space, Tooltip, Switch } from 'antd';
import { connect } from 'umi';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useNodeField } from '@/pages/controller/hooks/useNodeField';

const StepDbHeader = (props) => {
    const {
        dispatch,
        scriptManagement: { selectedNode, stepTreeList, envNameList, envListSingle, applicationList, commonVariable }
    } = props;

    // const [targetProjectId, setTargetProjectId] = useNodeField({dispatch, selectedNode, fieldKey: 'request_project_id', stepTreeList }); //. 所属系统value
    const [requestName, requestNameChange] = useNodeField({dispatch, selectedNode, fieldKey: 'content', extrakeys: [{ key: 'step_name' }], stepTreeList }); //. 脚本名称
    const [isSearchStop, setIsSearchStop] = useNodeField({dispatch, selectedNode, fieldKey: 'is_search_stop', stepTreeList });

    return (
        <div style={{ padding: 10, border: '1px solid #e5e7ee', borderLeft: '5px solid #409eff', borderRadius: 15 }}>
            <Row style={{ alignItems: 'center' }} >
                <Col span={2} style={{ textAlign: 'right', marginRight: 10 }}>
                    <label>名称：</label>
                </Col>
                <Col span={16}>
                    <Input
                        style={{ borderRadius: 6 }}
                        placeholder="请输入名称"
                        value={requestName}
                        onChange={requestNameChange}
                        disabled={selectedNode?.isQuote}
                    />
                </Col>
                <Col span={1} />
                <Col span={3} style={{ marginLeft: 8,textAlign: 'right' }}>
                    <Space>
                        <Tooltip title='首次查到数据后，终止所有数据库操作，即结束该步骤'>
                            <QuestionCircleOutlined style={{ cursor: 'pointer', color: '#1890ff' }} />查到即止：
                        </Tooltip>
                    </Space>
                </Col>
                <Col>
                    <Switch
                        className='capsule-switch'
                        style={{ marginLeft: 10 }}
                        checked={isSearchStop}
                        checkedChildren='开'
                        unCheckedChildren='关'
                        onChange={(checked) => {
                            console.log('isSearchStop checked: ', checked);
                            setIsSearchStop(checked);
                        }}
                    />
                </Col>
            </Row>
        </div>
    )
};

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(StepDbHeader);