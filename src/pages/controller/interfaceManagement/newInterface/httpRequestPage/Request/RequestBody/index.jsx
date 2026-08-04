import React, { useState, useEffect } from 'react';
import { Tabs, Radio } from 'antd';
import { connect } from 'umi';
import styles from './index.less';
import RequestFormData from './RequestFormData';
import RequestFormUrlencoded from './RequestFormUrlencoded';
import RequestJson from './RequestJson';
import RequestXml from './RequestXml';
import RequestRaw from './RequestRaw';

const RequestBody = (props) => {
    const {
        dispatch,
        interfaceManagement: { interfaceInfo, titleProtocalType }
    } = props;

    const [curType, setCurType] = useState('none');

    useEffect(() => {
        console.log('interfaceInfo', interfaceInfo);
        if (interfaceInfo?.request_args_type) {
            setCurType(interfaceInfo?.request_args_type);
        }
    }, [interfaceInfo])

    const handleChange = (e) => {
        setCurType(e.target.value);
        updateInterfaceInfo('request_args_type', e.target.value);
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
            {titleProtocalType == 'HTTP' ?
                <>
                    <div className={styles['request-body-scene']}>
                        <Radio.Group onChange={(e) => handleChange(e)} value={curType}>
                            <Radio value="none">none</Radio>
                            <Radio value="form-data">form-data</Radio>
                            <Radio value="x-www-form-urlencoded">x-www-form-urlencoded</Radio>
                            <Radio value="json">json</Radio>
                            <Radio value="raw">raw</Radio>
                        </Radio.Group>
                    </div>

                    <div className={styles['request-body-content']}>
                        {curType == 'none' && <div className={styles['request-body-content-none']} >当前请求没有请求体</div>}
                        {curType == 'form-data' && <RequestFormData />}
                        {curType == 'x-www-form-urlencoded' && <RequestFormUrlencoded />}
                        {curType == 'json' && <RequestJson />}
                        {curType == 'raw' && <RequestRaw />}
                    </div>
                </> : null}
            {titleProtocalType == 'TCP' ?
                <>
                    <div className={styles['request-body-scene']}>
                        <Radio.Group onChange={(e) => handleChange(e)} value={curType}>

                            <Radio value="xml">xml</Radio>
                            <Radio value="json">json</Radio>
                            <Radio value="raw">raw</Radio>
                        </Radio.Group>
                    </div>

                    <div className={styles['request-body-content']}>
                        {curType == 'xml' && <RequestXml />}
                        {curType == 'json' && <RequestJson />}
                        {curType == 'raw' && <RequestRaw />}
                    </div>
                </> : null}
        </div>
    )
}

export default connect(({ interfaceManagement }) => ({
    interfaceManagement
}))(RequestBody);
// export default RequestBody;