import React, { useState, useEffect } from 'react';
import CollapseComponent from './CollapseComponent';
import { Button } from 'antd';
import { generateUUID } from '@/utils/utils';
import { connect } from 'umi';

const Extract = (props) => {
    const {
        dispatch,
        // scriptManagement: { stepTreeList },
        interfaceManagement: { interfaceInfo }
    } = props;
    const [extractData, setExtractData] = useState([]);

    useEffect(() => {
        if (interfaceInfo?.extract_variables && interfaceInfo?.extract_variables.length > 0) {
            let newData = JSON.parse(JSON.stringify(interfaceInfo?.extract_variables));
            newData.map(item => {
                if (!item.id) {
                    item.id = generateUUID();
                }
            })
            setExtractData(newData);
        }
    }, []);

    //. 新增行
    const handleAdd = () => {
        setExtractData(prev => {
            let newObj = {
                id: generateUUID(),
                name: '',
                source: '',
                scope: "SOME",
                expr: '',
                index: ''
            };
            const newData = [...prev, newObj];

            return newData;
        })
    };

    //. 删除行
    const handleDelete = (e, record) => {
        e.preventDefault();
        e.stopPropagation();
        setExtractData(prev => {
            const newData = prev.filter(item => item.id !== record.id);

            updateInterfaceInfo('extract_variables', newData);
            return newData;
        });
    };

    //. 修改行
    const handleUpdateData = (record) => {
        //. 更新提取模块的 extract数组
        setExtractData(prev => {
            const newData = prev.map(item => {
                if (item.id === record.id) {
                    return { ...item, ...record };
                }
                return item;
            });

            updateInterfaceInfo('extract_variables', newData);
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
                {extractData.map((item, index) => (
                    <CollapseComponent
                        key={item.id}
                        currentData={item}
                        currentIndex={index}
                        onDelete={handleDelete}
                        onUpdateData={handleUpdateData}
                    />
                ))}
            </div>

            <Button style={{ width: '100%', marginTop: 10 }} type="dashed" onClick={handleAdd} >添加提取</Button>
        </div>
    )
}

export default connect(({ scriptManagement, interfaceManagement }) => ({
    scriptManagement,
    interfaceManagement
}))(Extract);
// export default Extract;