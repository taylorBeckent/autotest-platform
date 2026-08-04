import React from 'react';
import './LoadingDots.less';

const LoadingDots = ({text = '加载中'}) => {
    return (
        <div className='loading-container'>
            {text}
            <div className='dot-animation'>
                <span>●</span>
                <span>●</span>
                <span>●</span>
            </div>

        </div>
    )
}

export default LoadingDots;