import React, { useState, useEffect, useRef } from 'react';
import { Collapse, Button, Tag, Popover } from 'antd';
import DiffPatch from './DiffPatchMonaco';
import styles from './index.less';
import { DownloadOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

const CollapseComponent = (props) => {
    const {
        key,
        currentData,
        currentIndex
    } = props;

    const [leftVar, setLeftVar] = useState(); //. 变量A
    const [rightVar, setRightVar] = useState(); //. 变量B
    const [orderIgnore, setOrderIgnore] = useState(1); //. 忽略顺序
    const [downDisabled, setDownDisabled] = useState(true);
    const [expandKey, setExpandKey] = useState([]);
    const childRef = useRef(null);

    useEffect(() => {
        currentData?.left_name && setLeftVar(currentData?.left_name);
        currentData?.right_name && setRightVar(currentData?.right_name);
        setOrderIgnore(currentData?.order_control);
    }, []);

    useEffect(() => {
        // childRef.current ? setDownDisabled(false) : setDownDisabled(true);
        if (expandKey.length > 0) {
            setDownDisabled(false);
        }
    }, [childRef, expandKey])

    const handleChange = (key) => {
        setExpandKey(key);
    };

    const handleExportReport = (e) => {
        if (childRef.current) {
            e.stopPropagation();
            e.preventDefault();
            childRef.current.exportDiffReport();
        }
    };

    const HeaderRender = () => {
        return (
            <div className={styles['header']}>
                <div className={styles['content']}>
                    比较报文：
                    {leftVar ? <Tag color="processing" style={{ marginLeft: 10 }} >{leftVar}</Tag> : <span></span>}
                    {rightVar ? <Tag color="processing" style={{ margin: '0 10px ' }} >{rightVar}</Tag> : <span></span>}
                    是否忽略顺序：<span>{orderIgnore == 0 ? '是' : '否'}</span>
                </div>
                <div className={styles["actions"]}>

                    <Popover content={downDisabled ? '请先查看比对结果再执行下载操作' : '下载比对报告'}>
                        <Button type="link" icon={<DownloadOutlined />} disabled={downDisabled} onClick={handleExportReport} />
                    </Popover>
                    {/* <DownloadOutlined onClick={(e) => { handleExportReport(e) }} /> */}
                </div>
            </div>
        )
    };

    return (
        <div className={styles['collapse-container']} key={key}>
            <Collapse onChange={handleChange}>
                <Panel header={HeaderRender()} key="1" >
                    <DiffPatch currentData={currentData} ref={childRef} />
                </Panel>
            </Collapse>
        </div>
    )
};

export default CollapseComponent;