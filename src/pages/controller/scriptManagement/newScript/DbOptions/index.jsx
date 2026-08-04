import React from 'react';
import DatabaseOperationList from './DatabaseOperationList';
import StepDbHeader from './Header'

const StepDbOptions = (props) => {
    return (
        <div style={{ maxHeight: '600px; padding-bottom: 10px'}}>
            <StepDbHeader />
            {/* 后续单步调试时可用 */}
            {/* <SetpResponse /> */}
            <DatabaseOperationList />
        </div>
    )
}

export default StepDbOptions;