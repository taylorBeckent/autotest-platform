import React from 'react';
import Header from './Header';
import Request from './Request';
import Response from './Response';
import styles from './index.less';

const HttpPage = () => {
    return (
        <div>
            <Header />
            <div className={styles.httpContainer}>
                <Request />
                <Response />
            </div>
        </div>
    );
};

export default HttpPage;