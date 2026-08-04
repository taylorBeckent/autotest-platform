import React, { useState, useEffect } from 'react';
import CollapseComponent from './CollapseComponent';
import { connect } from 'umi';
import { Button } from 'antd';
import { generateUUID } from '@/utils/utils';
import utils from '../../../../utils';

const AssertRule = (props) => {

    const {
        dispatch,
        scriptManagement: { selectedNode, stepTreeList }
    } = props;

    const [assertData, setAssertData] = useState([]);
    const [isQuote, setIsQuote] = useState(false);

    useEffect(() => {
        if (selectedNode && selectedNode.assert_validators && selectedNode.assert_validators.length > 0) {
            let newData = JSON.parse(JSON.stringify(selectedNode.assert_validators));
            newData.map(item => {
                if (!item.id) {
                    item.id = generateUUID();
                }
            })

            setAssertData(newData);
        } else {
            setAssertData([]);
        }
        setIsQuote(selectedNode?.isQuote);
    }, [selectedNode]);

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
            updateTreeList([{ insertKey: 'assert_validators', insertValue: newData }]);

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

            updateTreeList([{ insertKey: 'assert_validators', insertValue: newData }]);

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
                {assertData.map((item, index) => (
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

            <Button style={{ width: '100%', marginTop: 10 }} type="dashed" onClick={handleAdd} disabled={isQuote} >添加断言</Button>
        </div>
    )
}

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(AssertRule);
// export default AssertRule;