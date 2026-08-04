import { Tooltip, Tag, Dropdown, Menu, } from 'antd';
import { QuestionCircleOutlined, WhatsAppOutlined, MessageOutlined, UsergroupAddOutlined, DownOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { connect, SelectLang, history } from 'umi';
import Avatar from './AvatarDropdown';
import HeaderSearch from '../HeaderSearch';
import styles from './index.less';
import NoticeIconView from './NoticeIconView';

// import toolbox1 from '../../../public/icons/toolbox1.png';

const ENVTagColor = {
  dev: 'orange',
  test: 'green',
  pre: '#87d068',
};

const GlobalHeaderRight = props => {

  const [hovered, setHovered] = useState(false);

  const { theme, layout } = props;
  let className = styles.right;

  if (theme === 'dark' && layout === 'top') {
    className = `${styles.right}  ${styles.dark}`;
  }
  const DropDownMenu = (record) => {
    return (
      <Menu mode="horizontal" style={{ maxHeight: '300px', maxWidth: '400px', overflow: 'auto' }}>
        <Menu.Item key="html"
          onClick={
            () => {
              history.push({
                pathname: '/AIHelper/testReportProduct'
              })
            }
          }
        >测试报告生成</Menu.Item>

      </Menu>
    )
  };

  return (
    <div className={className}>
      {hovered && (
        <div class="test-image" className={styles["test-image"]}>
          <img src="/icons/toolbox1.png" alt="" />
        </div>
      )}
      <div
        className={styles["hover-container"]}
      // onMouseEnter={() => {
      //   setHovered(true);
      // }}
      // onMouseLeave={() => {
      //   setHovered(false);
      // }}
      // onClick={() => {
      //   setHovered(true);
      //   setTimeout(() => {
      //     setHovered(false);
      //   }, 3000)
      // }}
      >
        {/* <span style={{ color: '#409eff' }}>工具箱答疑群：</span> */}
        <Dropdown overlay={DropDownMenu()} trigger={['click']}>
          <span style={{ color: '#409EFF', marginRight: '5px' }}>AI助手 <DownOutlined style={{ color: '#409EFF', marginRight: '5px' }} /></span>
        </Dropdown>
        <span
          onClick={() => {
            setHovered(true);
            setTimeout(() => {
              setHovered(false);
            }, 3000)
          }}
          style={{ color: '#409eff', letterSpacing: 1, }}>有问题请点击加入答疑群：</span>
        <UsergroupAddOutlined
          style={{ color: '#409eff', fontSize: 17 }}
          onClick={() => {
            setHovered(true);
            setTimeout(() => {
              setHovered(false);
            }, 3000)
          }}
        />
        {hovered && (
          <div class="test-image" className={styles["test-image"]}>
            <img src="/icons/toolbox1.png" alt="" />
          </div>
        )}
      </div>
      {/* <HeaderSearch
        className={`${styles.action} ${styles.search}`}
        placeholder="站内搜索"
        defaultValue="umi ui"
        options={[
          {
            label: <a href="https://umijs.org/zh/guide/umi-ui.html">umi ui</a>,
            value: 'umi ui',
          },
          {
            label: <a href="next.ant.design">Ant Design</a>,
            value: 'Ant Design',
          },
          {
            label: <a href="https://protable.ant.design/">Pro Table</a>,
            value: 'Pro Table',
          },
          {
            label: <a href="https://prolayout.ant.design/">Pro Layout</a>,
            value: 'Pro Layout',
          },
        ]} // onSearch={value => {
        //   //console.log('input', value);
        // }}
      /> */}
      {/* <Tooltip title="使用文档">
        <a
          style={{
            color: 'inherit',
          }}
          target="_blank"
          href="https://pro.ant.design/docs/getting-started"
          rel="noopener noreferrer"
          className={styles.action}
        >
          <QuestionCircleOutlined />
        </a>
      </Tooltip>
      <NoticeIconView /> */}
      {/* <Avatar menu /> */}
      {REACT_APP_ENV && (
        <span>
          <Tag color={ENVTagColor[REACT_APP_ENV]}>{REACT_APP_ENV}</Tag>
        </span>
      )}
      {/* <SelectLang className={styles.action} /> */}

    </div>
  );
};

export default connect(({ settings }) => ({
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeaderRight);
