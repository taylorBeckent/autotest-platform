/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, { DefaultFooter, SettingDrawer } from '@ant-design/pro-layout';
import React, { useEffect, useState, useRef, useForm } from 'react';
import { Link, useIntl, connect, history } from 'umi';
import { GithubOutlined, LaptopOutlined, RobotOutlined } from '@ant-design/icons';
import { Result, Button, Select, Drawer, Input, Form, Row, Col, message } from 'antd';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { getAuthorityFromRouter } from '@/utils/utils';
import logo from '../assets/logo.svg';
import styles from '@/global.less'
import { debounce, cloneDeep } from 'lodash';
import axios from 'axios';
import TypewriterText from '@/components/Message/TypewriterText';

// import { LaptopOutlined } from '@ant-design/icons';

const { TextArea } = Input
const noMatch = (
  <Result
    status={403}
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={
      <Button type="primary">
        <Link to="/user/login">Go Login</Link>
      </Button>
    }
  />
);

/**
 * use Authorized check all menu item
 */
const menuDataRender = menuList =>
  menuList.map(item => {
    const localItem = {
      ...item,
      children: item.children ? menuDataRender(item.children) : undefined,
    };
    return Authorized.check(item.authority, localItem, null);
  });

const defaultFooterDom = (
  <DefaultFooter
    copyright={'2024 自动化工具箱'}
    links={[
      //   {
      //     key: 'Ant Design Pro',
      //     title: 'Ant Design Pro',
      //     href: 'https://pro.ant.design',
      //     blankTarget: true,
      //   },
      //   {
      //     key: 'github',
      //     title: <GithubOutlined />,
      //     href: 'https://github.com/ant-design/ant-design-pro',
      //     blankTarget: true,
      //   },
      //   {
      //     key: 'Ant Design',
      //     title: 'Ant Design',
      //     href: 'https://ant.design',
      //     blankTarget: true,
      //   },
    ]}
  />
);

const BasicLayout = props => {
  const {
    dispatch,
    children,
    settings,
    aiQuest: { messageList },
    routes,
    location = {
      pathname: '/',
    },
  } = props;
  /**
   * constructor
   */
  const [form] = Form.useForm();
  const [menuDropList, setMenuDropList] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [messageId, setMessageId] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [newMessageList, setNewMessageList] = useState([]);
  const [leftMessageList, setLeftMessageList] = useState('');

  useEffect(() => {

  }, []);
  // const 
  const onClose = () => {
    setDrawerVisible(false)
    form.resetFields()

  }
  const handleChange = async () => {

    form.resetFields()
    // let params = form.getFieldValue('content')
    let arr = cloneDeep(messageList)
    let obj = { right: messageContent, messageId: arr.length + 1 }
    arr.push(obj)
    arr.push({ left: '答案生成中...', message: '' })
    setNewMessageList(arr)
    dispatch({
      type: 'aiQuest/syncMessageList',
      messageList: arr
    });
    setCreating(true)





    let url = `/testPoint/deepseek/query`
    let eventSource
    if(messageId==''){
      eventSource = new EventSource(`${url}?query=${messageContent}`)
    }else{
      eventSource = new EventSource(`${url}?query=${messageContent}&conversationId=${messageId}`)
    }
    // const eventSource = new EventSource(`${url}?query=${messageContent}`)

    eventSource.onmessage = (event) => {
      let str = JSON.parse(event.data)
      if(str?.conversationId){
        eventSource.close()
        setMessageId(str.conversationId)
        setCreating(false)
        return
      }
      if (arr[arr.length - 1].left == '答案生成中...') {
        arr[arr.length - 1].left = str.answer
      } else {
        arr[arr.length - 1].left = arr[arr.length - 1].left + str.answer

      }
      let newArr = cloneDeep(arr)
      setTimeout(() => {
        setNewMessageList(newArr)
      }, 0);

      // updatedom()
    }
    eventSource.onerror = (event) => {
      setCreating(false)
      eventSource.close()
      // setMessageId(data.conversationId)
    }


  }
  /**
   * init variables
   */

  //.搜索栏递归
  /**
   * @param req 原始数组
   * @param arr 操作数组
  */
  const generateMenuList = (req, arr) => {
    req.map(item => {
      if (!item.children) {
        if (item.name) {
          let obj = {};
          obj.name = item.name;
          obj.path = item.path;
          arr.push(obj);
        }
      } else {
        generateMenuList(item.children, arr);
      }
    })
    return arr;
  }

  const selectMenuList = generateMenuList(routes[1].routes, []);

  //.搜索栏content change
  const selectChange = (e) => {
    if (e) {
      let templateList = selectMenuList.filter(item => item.name.indexOf(e) > -1);
      setMenuDropList(templateList);
    } else {
      setMenuDropList([]);
    }
  }

  const handleMenuCollapse = payload => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  }; // get children authority

  const authorized = getAuthorityFromRouter(props.route.routes, location.pathname || '/') || {
    authority: undefined,
  };
  const { formatMessage } = useIntl();
  return (
    <>
      <ProLayout
        logo={logo}
        formatMessage={formatMessage}
        onCollapse={handleMenuCollapse}
        onMenuHeaderClick={() => history.push('/')}
        menuItemRender={(menuItemProps, defaultDom) => {
          // console.log('menuItemProps', menuItemProps, defaultDom);
          if (menuItemProps.isUrl || !menuItemProps.path) {
            return defaultDom;
          }

          return <Link to={menuItemProps.path}>{defaultDom}</Link>;
        }}
        breadcrumbRender={(routers = []) => [
          {
            path: '/',
            breadcrumbName: formatMessage({
              id: 'menu.home',
            }),
          },
          ...routers,
        ]}
        itemRender={(route, params, routes, paths) => {
          const first = routes.indexOf(route) === 0;
          return first ? (
            <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
          ) : (
            <span>{route.breadcrumbName}</span>
          );
        }}
        footerRender={() => defaultFooterDom}
        menuDataRender={menuDataRender}
        rightContentRender={() => <RightContent />}
        menuExtraRender={() => (
          <Select
            style={{ width: '100%' }}
            showSearch
            allowClear
            optionFilterProp='children'
            placeholder="请输入菜单名称"
            onClear={() => { setMenuDropList([]) }}
            onSearch={e => { selectChange(e) }}
            onSelect={e => { e && history.push({ pathname: e }) }}
          >
            {menuDropList && menuDropList.length > 0 && menuDropList.map(item => (
              <Option key={item.path} value={item.path}>{item.name}</Option>
            ))}
          </Select>
        )}
        {...props}
        {...settings}
      >
        <Authorized authority={authorized.authority} noMatch={noMatch}>
          <Button
            type="primary"
            size='large'
            icon={<LaptopOutlined />}
            style={{
              position: 'absolute',
              bottom: '-5%',
              right: '10px',
              zIndex: '9'
            }}
            onClick={() => { setDrawerVisible(true) }}
          >测试deepseek</Button>
          {children}
          <Drawer
            title="测试deepseek"
            width={'50%'}
            placement="right"
            // closable={false}
            onClose={onClose}
            visible={drawerVisible}
            className={styles.DrawerFlow}
            style={{ zIndex: '10' }}
          >

            <div style={{ width: '100%', height: '100vh', paddingBottom: '70px' }}>
              <div style={{ height: '80%', width: '90%', overflowY: 'auto', position: 'relative' }} >
                <div style={{
                  width: '72%',
                  display: messageList.length == 0 ? 'block' : 'none',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  fontSize: '18px',
                  color: '#11111180',
                  transform: 'translate(-50%,-50%)'
                }}>
                  <p>您好,我是测试deepseek助手,有什么可以帮您?</p>
                  <p>注:优先匹配知识库,若未匹配到,则使用大数据通用能力回答</p>
                </div>

                {/* {messageList.map((item, index) => { */}
                {newMessageList.map((item, index) => {
                  let newItem = cloneDeep(item)
                  // console.log('newItem----', newItem);
                  if (newItem.left) {
                    let newContent = cloneDeep(newItem.left)
                    // console.log('是否走到这里------', newContent);
                    return (
                      <div style={{ display: 'flex', margin: '10px' }}>
                        <div
                          style={{
                            height: '35px',
                            width: '35px',
                            borderRadius: '50%',
                            background: '#19d810',
                            marginLeft: '5px',
                            textAlign: 'center',
                            lineHeight: '35px'
                          }}>
                          <RobotOutlined style={{ fontSize: '20px', color: '#ffffff' }} />
                        </div>
                        <div className={styles.left}>{newItem.left}</div>

                      </div>
                    )
                  }
                  if (newItem.right) {
                    return (
                      <div style={{ overflow: 'hidden', margin: '10px' }}>
                        <div
                          style={{
                            height: '35px',
                            width: '35px',
                            borderRadius: '50%',
                            background: '#1890ff',
                            float: 'right'
                          }}></div>
                        <div key={Date.now()} className={styles.right}>{newItem.right}</div>

                      </div>

                    )
                  }
                })}
                {/* {updatedom([])} */}

              </div>
              <div style={{ height: '20%' }}>
                <Form className={styles.conditionStyle} form={form}>
                  <Row>
                    <Col span={20}>
                      <Form.Item labelCol={{ span: 0 }} wrapperCol={{ span: 24 }} label='' name='content' >

                        <TextArea
                          style={{ width: '90%' }}
                          rows={4}
                          onChange={(e) => { setMessageContent(e.target.value) }}
                          onPressEnter={(e) => {
                            if (creating) {
                              message.warning('请耐心等待答案生成')
                              return
                            }
                            if (!messageContent) {
                              message.warning('请先输入内容')
                              return
                            }
                            handleChange()
                          }
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={4} style={{ paddingTop: '8%' }}>
                      <Button type='primary' onClick={() => {
                        // setMessageContent(form.getFieldValue('content'))
                        if (creating) {
                          message.warning('请耐心等待答案生成')
                          return
                        }
                        if (!messageContent) {
                          message.warning('请先输入内容')
                          return
                        }
                        handleChange()
                      }}>发送</Button>

                    </Col>
                  </Row>

                </Form>
              </div>
            </div>
          </Drawer>
        </Authorized>
      </ProLayout>

    </>
  );
};

export default connect(({ global, settings, aiQuest }) => ({
  collapsed: global.collapsed,
  settings,
  aiQuest,
}))(BasicLayout);
