import React, { useState, useEffect } from 'react';
import CollapseComponent from './CollapseComponent';
import { Button } from 'antd';
import { generateUUID } from '@/utils/utils';
import { connect } from 'umi';

const MessageCompare = (props) => {
    const {
        dispatch,
        selectedRecord,
    } = props;

    const [compareData, setCompareData] = useState([]);

    useEffect(() => {
        const compareList = selectedRecord?.response_body?.message_comparison;
        (Array.isArray(compareList) && compareList.length > 0) ? setCompareData(compareList) : setCompareData([]);
    }, []);

    return (
        <div style={{ width: '60%', maxHeight: '800px', overflowY: 'auto', padding: 10, border: '1px solid #d9d9d9' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {compareData.map((item, index) => (
                    <CollapseComponent
                        key={index}
                        currentData={item}
                        currentIndex={index}
                    />
                ))}
            </div>
        </div>
    )
}

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(MessageCompare);
