import { useRef, useEffect, useState } from "react";
import { CopyOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Input, Space, Button, Form, Select, Modal, AutoComplete, message } from "antd";
import { debounce } from "lodash";
import styles from './index.less';
import { databaseFieldMustObj } from "@/pages/controller/common";

const { TextArea } = Input;

const renderLabel = (item, env) => {
    return (
        <div style={{ width: 400, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px', ':hover': { backgroundColor: '#fafafa'} }}>
            <span>{item.db_name}</span>
            {env && <span>{item.env_name}</span>}
        </div>
    );
};

const OperationItem = ({
    dispatch,
    name,
    remove,
    add,
    editingId,
    setEditingId,
    stepCode
}) => {
    const form = Form.useFormInstance();
    const [configOptions, setConfigOptions] = useState({}); // 配置名
    const [dbNameOptions, setDbNameOptions] = useState({}); // 数据库名
    const [isSelectSql, setIsSelectSql] = useState(false);
    const [operationsConfigs, setOperationsConfigs] = useState({});

    const inputRef = useRef();

    const isVariable = (val) => typeof val === 'string' && val.trim().startsWith('${');
    const [hover, setHover] = useState(false);
    const [configNamePlaceholder, setConfigNamePlaceholder] = useState('请选择或输入配置名，配置名支持引用变量');
    const [dbNamePlaceholder, setDbNamePlaceholder] = useState('请选择或输入数据库名，数据库名支持引用变量');


    useEffect(() => {
        if (editingId === name) {
            inputRef.current?.focus();
        }
    }, [editingId]);

    useEffect(() => {
        setTimeout(() => {
            queryConfigsInit();
        }, 300);
    }, [stepCode]);

    const debouncedSearchRef = useRef(
        debounce((e, name, form, optionsSource, setOperationsConfigs, updateKey) => {
            const cfgOptions = optionsSource[form.getFieldValue(['operations', name, 'project_id'])];
            let filters = cfgOptions?.filter(item => item.value?.toLowerCase().includes(e.toLowerCase()));
            let configName = "";
            if (updateKey === "dbNameOptions") {
                configName = form.getFieldValue(['operations', name, 'config_name']) ?? "";
                if (configName === "") {
                    filters = cfgOptions?.filter(item => item.db_name?.toLowerCase().includes(e.toLowerCase()));
                } else {
                    filters = e === "" ? cfgOptions?.filter(item => item.config_name === configName) : cfgOptions?.filter(item => item.config_name === configName && item.value?.toLowerCase().includes(e.toLowerCase()));
                }
            }
            setOperationsConfigs(prev => 
                (
                    {
                        ...prev,
                        [name]: {
                            ...prev[name],
                            [updateKey]: filters
                        }
                    }
                )
            );
        }, 300)
    ).current;

    const queryConfigsInit = async () => {
        const operations = form.getFieldValue('operations') || [];
        const appIds = operations.reduce((acc, item, index) => {
            const projectId = item.project_id;
            if (projectId != null) {
                if(!acc[projectId]) {
                    acc[projectId] = [];
                }
                acc[projectId].push(index);
            }
            return acc;
        }, {});
        const uniqueProjectIds = Object.keys(appIds);
        const queryConfigs = uniqueProjectIds.map(projectId => queryEnvAppsChildConfig(projectId, appIds[projectId]));
        try {
            await Promise.all(queryConfigs);
        } catch (error) {
            message.warn("请求失败");
        }
    };

    const filterDnConfig = (configOptions) => {
        const keys = {};
        const configs = configOptions.filter(item => item.db_type !== null).map(item => item);
        const dbOp = configs.map(item => ({...item, value: item.db_name, label: item.db_name, key: `${item.db_name}_${item.config_name}_${item.env_name}` }))?.reduce((acc, cur) => {
            const key = `${cur.config_name}_${cur.db_name}`;
            if (!keys.hasOwnProperty(key)) {
                acc.push(cur);
                keys[key] = 0;
            }
            keys[key]++;
            return acc;
        }, []);
        const cfgOpsS = configs.map(item => ({...item, value: item.config_name, label: item.config_name, key: `${item.db_name}_${item.config_name}_${item.env_name}`}));
        const cfgOps = cfgOpsS.reduce((acc, cur) => {
            const key = cur.config_name;
            if (!keys.hasOwnProperty(key)) {
                acc.push(cur);
                keys[key] = 0;
            }
            keys[key]++;
            return acc;
        }, []);
        const cfgDbOps = dbOp.reduce((acc, cur) => {
            const key = `${cur.config_name}_${cur.db_name}`;
            // acc.push({...cur, label: keys[key] === 1 ? `${cur.db_name} ${cur.env_name}` : cur.db_name });
            acc.push({...cur, label: renderLabel(cur, keys[key] === 1) });
            return acc;
        }, []);
        const curConfigName = form.getFieldValue(['operations', name, 'config_name']);
        const selectDbOp = cfgDbOps.filter(item => curConfigName=== null || curConfigName === undefined || curConfigName === "" || item.config_name === curConfigName);
        return { cfgOps: cfgOps, dbOp: cfgDbOps, selectDbOp: selectDbOp };
    };

    const queryEnvAppsChildConfig = (appId, operationPositions) => {
        let params = {
            env_info_id: appId,
            env_type: 3,
            page: 1,
            page_size: 100
        };

        dispatch({
            type: 'scriptManagement/QueryEnvAppsChildConfig',
            payload: params,
            callback: (data) => {
                const configs = filterDnConfig(data);
                setConfigOptions({ [appId]: configs.cfgOps});
                setDbNameOptions({[appId]: configs.dbOp});
                setOperationsConfigs(prev => ({
                    ...prev,
                    ...Object.fromEntries(
                        operationPositions.map(index => [index, { configOptions: configs.cfgOps, dbNameOptions: configs.selectDbOp }])
                    )
                }));
            }
        });
    }
    
    const sqlValidator = (allowedTypes = ['select']) => {
        return (_, value) => {
            if (!value) {
                return Promise.reject('请输入SQL语句');
            }

            const trimmed = value.trim();
            const statements = trimmed.split(';').map(s => s.trim()).filter(Boolean);
            if (statements.length > 1) {
                return Promise.reject('目前只支持单条SQL语句.');
            }
            const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase();
            if (firstWord.toLowerCase() === 'select') {
                setIsSelectSql(true);
            }
            if (!allowedTypes.includes(firstWord)) {
                return Promise.reject(`当前仅支持${allowedTypes.join(', ')}语句`);
            }
            return Promise.resolve();
        };
    };

    const checkDatabaseNameOnly = () => {
        const nameList = form.getFieldValue("operations").map(item => item.name);
        const nameSet = [...new Set(nameList)];
        if (nameList.length != nameSet.length) {
            message.warning("数据库操作名称不能重复");
            form.setFieldValue(['operations', name, 'name'], nameList[name] + " 副本");
        }
    };

    return (
        <div
            style={{
                border: '1px solid #e4e7ed',
                borderRadius: 4,
                marginBottom: 16,
                background: '#fafafa'
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '4px 16px',
                    background: '#f5f7fa',
                    borderBottom: '1px solid #e4e7ed'
                }}>
                    <div
                        onClick={() => setEditingId(name)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            flex: 1
                        }}
                    >
                        {editingId !== name && (
                        <span
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            style={{ color: hover ? '#1890ff' : 'inherit'}}
                        >
                        {form.getFieldValue('operations')[name]['name']}
                            <EditOutlined style={{ marginLeft: 8 }}/>
                        </span>)}
                        {editingId === name && (
                            <Form.Item name={[name, 'name']} style={{ padding: "0px", marginBottom: 3 }}>
                                <Input
                                    style={{
                                        width: 260,
                                        border: "none",
                                        borderBottom: "1px solid #1890ff",
                                        borderRadius: "0px",
                                        boxShadow: "none",
                                        paddingLeft: "0px",
                                        background: "transparent"
                                    }}
                                    ref={inputRef}
                                    onBlur={() => { checkDatabaseNameOnly(); setEditingId(null);  setHover(false); }}
                                    onPressEnter={() => { checkDatabaseNameOnly(); setEditingId(null);  setHover(false); }}
                                    placeholder="请输入数据库操作名称"
                                />
                            </Form.Item>
                        )}
                    </div>
                    <Space>
                        <Button
                            type="link"
                            icon={<CopyOutlined />}
                            onClick={() => {
                                const operations = form.getFieldsValue(true).operations;
                                const target = operations[name];
                                add({
                                    ...target,
                                    name: `${target.name} 副本`
                                }, name + 1)
                            }}
                        >复制</Button>

                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e)=>{
                                e.stopPropagation();
                                const operations = form.getFieldsValue(true).operations;
                                if (operations.length > 1) {
                                    Modal.confirm({
                                        title: '确认删除',
                                        content: '确定要删除此项?此操作不可撤销!',
                                        okText: '确认',
                                        cancelText: '取消',
                                        onOk: () => {
                                            remove(name);
                                        },
                                        onCancel: () => {}
                                    });
                                } else {
                                    message.warning("必须保留一个数据库配置");
                                }
                                
                            }}
                        >删除</Button>
                    </Space>
            </div>
            <div style={{ padding: 16 }}>
                <Form.Item
                    style={{ marginBottom: 12 }}
                    labelCol={{ span: 2 }}
                    wrapperCol={{ span: 22 }}
                    name={[name, 'project_id']}
                    label={databaseFieldMustObj.project_id}
                    rules={[{ required: true, message: '请选择应用' }]}
                >
                    <Select
                        showSearch
                        allowClear
                        placeholder="请选择应用"
                        optionFilterProp="project_name"
                        optionLabelProp="project_name"
                        fieldNames={{
                            value: 'id',
                            label: 'project_name'
                        }}
                        options={form.getFieldValue('appOptions')}
                        style={{ borderRadius: 8 }}
                        dropdownStyle={{ borderRadius: 8 }}
                        onSelect={(inputValue, options) => {
                            queryEnvAppsChildConfig(inputValue, [name]);
                            form.setFieldsValue({
                                operations: {
                                    [name]: {
                                        project_name: options.project_name,
                                        config_name: undefined,
                                        database_name: undefined
                                    }
                                }
                            });
                        }}
                        onClear={(e) => {
                            form.setFieldsValue({
                                operations: {
                                    [name]: {
                                        config_name: undefined,
                                        database_name: undefined
                                    }
                                }
                            });
                        }}
                        filterOption={(inputValue, options) => {
                            return options.project_name.toLowerCase().includes(inputValue.toLowerCase());
                        }}
                    />
                </Form.Item>

                <Form.Item
                    style={{ marginBottom: 12 }}
                    labelCol={{ span: 2 }}
                    wrapperCol={{ span: 22 }}
                    name={[name, 'config_name']}
                    label={databaseFieldMustObj.config_name}
                    rules={[{ required: true, message: '请选择或输入配置名' }]}
                >
                    <AutoComplete
                        allowClear
                        placeholder={configNamePlaceholder}
                        options={operationsConfigs[name]?.configOptions}
                        onChange={(e) => {
                            if (isVariable(e)) {
                                const dbOp = form.getFieldValue(['operations', name, 'database_name']);
                                if (!isVariable(dbOp)) {
                                    form.setFieldValue(['operations', name, 'database_name'], undefined);
                                    setDbNamePlaceholder('请输入变量，如${dbName}');
                                }
                            } else {
                                setDbNamePlaceholder('请选择或输入数据库名，数据库名支持引用变量');
                            }
                        }}
                        onSearch={(e) => {
                            debouncedSearchRef(e, name, form, configOptions, setOperationsConfigs, "configOptions");
                        }}
                        onSelect={(value) => {
                            const dbOptions = dbNameOptions[form.getFieldValue(['operations', name, 'project_id'])];
                            const dbOp = form.getFieldValue(['operations', name, 'database_name']);
                            if (!isVariable(dbOp)) {
                                form.setFieldValue(['operations', name, 'database_name'], undefined);
                                setDbNamePlaceholder('请选择数据库名');
                            }
                            setOperationsConfigs(prev => 
                                (
                                    {
                                        ...prev,
                                        [name]: {
                                            ...prev[name],
                                            dbNameOptions: dbOptions?.filter(item => item.config_name === value) }
                                    }
                                )
                            );
                        }}
                    />
                </Form.Item>

                <Form.Item
                    style={{ marginBottom: 12 }}
                    labelCol={{ span: 2 }}
                    wrapperCol={{ span: 22 }}
                    name={[name, 'database_name']}
                    label={databaseFieldMustObj.database_name}
                    rules={[{ required: true, message: '请选择或输入数据库名' }]}
                >
                    <AutoComplete
                        allowClear
                        popupClassName={styles.certainCategorySearchDropdown}
                        dropdownMatchSelectWidth={500}
                        placeholder={dbNamePlaceholder}
                        options={operationsConfigs[name]?.dbNameOptions}
                        onChange={(e) => {
                            if (isVariable(e)) {
                                const cfgOp = form.getFieldValue(['operations', name, 'config_name']);
                                if (!isVariable(cfgOp)) {
                                    // form.setFieldValue(['operations', name, 'config_name'], undefined);
                                    setConfigNamePlaceholder('请输入变量，如${configName}');
                                }
                            } else {
                                setConfigNamePlaceholder('请选择或输入配置名，配置名支持引用变量');
                            }
                        }}
                        onSearch={(e) => {
                            debouncedSearchRef(e, name, form, dbNameOptions, setOperationsConfigs, "dbNameOptions");
                        }}
                        onSelect={(e) => {
                            const curCfgOp = form.getFieldValue(['operations', name, 'config_name']);
                            if (!isVariable(curCfgOp)) {
                                const configOp = operationsConfigs[name]?.dbNameOptions;
                                const configName = configOp.filter(item => item.db_name === e);
                                form.setFieldValue(['operations', name, 'config_name'], configName.length > 0 ? configName[0].config_name : undefined);
                            }
                        }}
                    />
                </Form.Item>

                <Form.Item
                    style={{ marginBottom: 12 }}
                    labelCol={{ span: 2 }}
                    wrapperCol={{ span: 22 }}
                    name={[name, 'expr']}
                    label={databaseFieldMustObj.expr}
                    validateDebounce={300}
                    validateFirst={true}
                    validateTrigger={['onChange']}
                    rules={[{ required: true, message: '请输入有效SQL' }, { validator: sqlValidator(['select']) }]}
                >
                    <TextArea
                        rows={4}
                        placeholder="请输入SQL语句，表名、字段名均支持引用变量，如： SELECT * FROM ${表名} where id = ${userId};"
                        spellCheck={false}
                        style={{
                            fontSize: 16,
                            lineHeight: 1.6,
                            borderRadius: 8
                        }}
                        // onChange={() => form.validateFields(['operations', name, 'sql'])}
                    />
                </Form.Item>

                <Form.Item
                    style={{ marginBottom: 12 }}
                    labelCol={{ span: 2 }}
                    wrapperCol={{ span: 22 }}
                    name={[name, 'variable_name']}
                    label={databaseFieldMustObj.variable_name}
                    rules={[{ required: isSelectSql, message: '请为查询结果命名' }]}
                >
                    <Input
                        style={{ borderRadius: 6 }}
                        placeholder="SQL结果保存为该变量"
                    />
                </Form.Item>
            </div>
        </div>
    );
};

export default OperationItem;