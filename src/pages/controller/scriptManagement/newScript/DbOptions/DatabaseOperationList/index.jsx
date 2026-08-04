import { connect } from 'umi';
import { useNodeField } from '@/pages/controller/hooks/useNodeField';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Select } from 'antd';
import { useEffect, useState } from 'react';
import OperationItem from './OperationItem';
import styles from './index.less';

const DatabaseOperationList = (props) => {
    const {
        dispatch,
        scriptManagement: { envAppsData, selectedNode, stepTreeList, envNameList, envListSingle, applicationList, commonVariable }
     } = props;
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);
    const [appOptionsList, setAppOptionsList] = useState(envAppsData);
    const [stepDataConfigCount, setStepDataConfigCount] = useState({});
    const [stepKey, setStepKey] = useState('');


    const defaultOperations = {
        name: '数据库操作 1',
        project_id: undefined,
        project_name: undefined,
        config_name: undefined,
        database_name:  undefined,
        is_search_stop: false,
        expr: '',
        variable_name: '',
        desc: ''
    };

    const [requestArgsType, setRequestArgsType] = useNodeField({dispatch, selectedNode, fieldKey: 'request_args_type', stepTreeList });
    const [databaseOperates, setDatabaseOperates] = useNodeField({dispatch, selectedNode, fieldKey: 'database_operates', stepTreeList });
     
    useEffect(() => {
        if (selectedNode.nodeType == 5) {
            setRequestArgsType('raw');
        }
    }, []);

    useEffect(() => {
        // form.setFieldValue('operations', databaseOperates === undefined || databaseOperates === null ? [defaultOperations] : databaseOperates);
        const key = selectedNode.step_no ? selectedNode.step_no + '' : selectedNode.id;
        const curCfgCnt = getCurStepDataConfigSize(selectedNode.database_operates);
        const curCount = stepDataConfigCount[key] ?? 1;
        const count = selectedNode.database_operates != undefined ? selectedNode.database_operates.length > curCount ? selectedNode.database_operates.length : curCount : 1;
        setStepDataConfigCount(prev => ({...prev, [key]: Math.max(count, curCfgCnt)}));
        setStepKey(key);
        form.setFieldValue('operations', selectedNode.database_operates ? selectedNode.database_operates : [defaultOperations]);
    }, [selectedNode]);

    const getCurStepDataConfigSize = (databaseList) => {
        const nameList = databaseList == undefined ? ['1'] : databaseList.map(item => item.name).map(item => item.split(" ")[1]);
        const max = Math.max(...nameList.map(Number));
        const len = databaseList == undefined ? 1 : databaseList.length;
        const maxLen = Number.isNaN(max) ? 0 : max;
        return len > maxLen ? len : maxLen;
    }

    return (
        <Form
            form={form}
            style={{ marginTop: 12 }}
            initialValues={{
                appOptions: appOptionsList
            }}
            onValuesChange={(changedValues, allValues) => {
                setTimeout(() => {
                    setDatabaseOperates(form.getFieldsValue(true).operations.map(item => ({...item, is_search_stop: selectedNode.is_search_stop ?? false })));
                }, 300);
            }}
        >
            <Form.List name="operations">
                {(fields, { add, remove }) => (
                    <>
                        <div className={styles.dbContainer}> 
                            {fields.map(({key, name, ...restField}, index) => {
                                return (
                                    <OperationItem
                                        dispatch={dispatch}
                                        key={key}
                                        name={name}
                                        remove={remove}
                                        add={add}
                                        editingId={editingId}
                                        setEditingId={setEditingId}
                                        stepCode={selectedNode.step_code}
                                    />
                                );
                            })}
                        </div>
                        <Button
                            type='dashed'
                            block
                            icon={<PlusCircleOutlined />}
                            onClick={() => {
                                add({
                                    name: `数据库操作 ${stepDataConfigCount[stepKey] + 1}`,
                                    project_id: undefined,
                                    project_name: undefined,
                                    config_name: undefined,
                                    database_name: undefined,
                                    expr: '',
                                    variable_name: ''
                                });
                                setStepDataConfigCount(prev => ({...prev, [stepKey]: prev[stepKey] + 1}));
                            }}
                            >新增</Button>
                    </>
                )}
            </Form.List>
        </Form>
    );
};

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(DatabaseOperationList);
// export default DatabaseOperationList;