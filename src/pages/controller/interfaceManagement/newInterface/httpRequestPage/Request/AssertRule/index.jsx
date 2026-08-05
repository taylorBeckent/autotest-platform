import React, { useState, useEffect } from 'react';
import CollapseComponent from './CollapseComponent';
import { connect } from 'umi';
import { Button } from 'antd';
import { generateUUID } from '@/utils/utils';

const AssertRule = (props) => {

    const {
        dispatch,
        // scriptManagement: { stepTreeList },
        interfaceManagement: { interfaceInfo }
    } = props;

    const [assertData, setAssertData] = useState([]);

    useEffect(() => {
        if (interfaceInfo?.assert_validators && interfaceInfo?.assert_validators.length > 0) {
            let newData = JSON.parse(JSON.stringify(interfaceInfo?.assert_validators));
            newData.map(item => {
                if (!item.id) {
                    item.id = generateUUID();
                }
            })

            setAssertData(newData);
        }
    }, []);

    const handleAdd = () => {
        setAssertData(prev => {
            let newObj = {
                id: generateUUID(),
                name: '',
                source: '',
                expr: '',
                operation: '',
                except_value: '',
            };
            const newData = [...prev, newObj];

            return newData;
        })
    };

    const handleDelete = (e, record) => {
        e.preventDefault();
        e.stopPropagation();
        setAssertData(prev => {
            const newData = prev.filter(item => item.id !== record.id);

            updateInterfaceInfo('assert_validators', newData);
            return newData;
        });
    };

    const handleUpdateData = (record) => {
        setAssertData(prev => {
            const newData = prev.map(item => {
                if (item.id === record.id) {
                    return { ...item, ...record };
                }
                return item;
            });

            updateInterfaceInfo('assert_validators', newData);
            return newData;
        })
    };

    //. 更新数据
    const updateInterfaceInfo = (field, value) => {
        dispatch({
            type: 'interfaceManagement/syncInterfaceInfo',
            interfaceInfo: {
                ...interfaceInfo,
                [field]: value
            }
        })
    };

    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {assertData.map((item, index) => (
                    <CollapseComponent
                        key={item.id}
                        currentData={item}
                        currentIndex={index}
                        onDelete={handleDelete}
                        onUpdateData={handleUpdateData}
                    />
                ))}
            </div>

            <Button style={{ width: '100%', marginTop: 10 }} type="dashed" onClick={handleAdd} >添加断言</Button>
        </div>
    )
}

export default connect(({ scriptManagement, interfaceManagement }) => ({
    scriptManagement,
    interfaceManagement
}))(AssertRule);