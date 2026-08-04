// import { PageLoading } from '@ant-design/pro-layout'; // loading components from code split
import React from 'react';
import { Spin } from 'antd';
// https://umijs.org/plugin/umi-plugin-react.html#dynamicimport

// export default PageLoading;

// export default () => <></>;

export default () => {
    return (
        <div style={{
            paddingTop: 100,
            textAlign: 'center',
        }}>
            <Spin size='large'/>
        </div>
    )
};
