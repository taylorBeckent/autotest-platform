import React from 'react';
import Header from './Header';
import Request from './Request';
import Response from './Response';

const HttpPage = (props) => {
    const {
        onLoading
    } = props;

    return (
        <div style={{ width: '100%' }}>
            <Header onLoading={onLoading} />
            <Request />
            <Response />
        </div>
    );
};

export default HttpPage;