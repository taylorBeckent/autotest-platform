import React, { useState, useEffect } from 'react';
import CollapseComponent from './CollapseComponent';
import { Button } from 'antd';
import { generateUUID } from '@/utils/utils';
import utils from '../../../../utils';
import { connect } from 'umi';

const Extract = (props) => {
    const {
        dispatch,
        scriptManagement: { selectedNode, stepTreeList }
    } = props;
    const [extractData, setExtractData] = useState([]);
    const [isQuote, setIsQuote] = useState(false);

    useEffect(() => {
        if (selectedNode && selectedNode.extract_variables && selectedNode.extract_variables.length > 0) {
            let newData = JSON.parse(JSON.stringify(selectedNode.extract_variables));
            newData.map(item => {
                if (!item.id) {
                    item.id = generateUUID();
                }
            })

            setExtractData(newData);
        } else {
            setExtractData([]);
        }

        setIsQuote(selectedNode?.isQuote);
    }, [selectedNode]);

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
            updateTreeList([{ insertKey: 'extract_variables', insertValue: newData }]);

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

            updateTreeList([{ insertKey: 'extract_variables', insertValue: newData }]);

            return newData;
        })
    };

    //. 更新整个树结构-对应节点修改
    const updateTreeList = (insertList) => {
        let finalList = utils.recurseTreeList(stepTreeList, insertList, selectedNode);

        dispatch({
            type: 'scriptManagement/syncStepTreeList',
            stepTreeList: finalList
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
                        isQuote={isQuote}
                    />
                ))}
            </div>

            <Button style={{ width: '100%', marginTop: 10 }} type="dashed" onClick={handleAdd} disabled={isQuote} >添加提取</Button>
        </div>
    )
}

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(Extract);
// export default Extract;