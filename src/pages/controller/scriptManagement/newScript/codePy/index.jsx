import React from 'react';
import SetpResponse from '../SetpResponse';
import HeaderCodePy from './Header';
import StepRequests from '../StepRequests';

const CodePy = (props) => {
    return (
        <div>
            <HeaderCodePy />
            <StepRequests />
            {/* 后续单步调试时可用 */}
            {/* <SetpResponse /> */}
        </div>
    )
}

export default CodePy;