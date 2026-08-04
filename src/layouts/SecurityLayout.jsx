import React from 'react';
import { PageLoading } from '@ant-design/pro-layout';
import { Redirect, connect } from 'umi';
import { stringify } from 'querystring';

class SecurityLayout extends React.Component {
  state = {
    isReady: false,
    userInfo: '',
    isLogin: '',
  };

  componentDidMount() {
    // const { dispatch, currentUser } = this.props;
    // const userInfo = sessionStorage.getItem('userInfo') ? JSON.parse(sessionStorage.getItem('userInfo')) : undefined;
    // const isLogin = currentUser?.userName || userInfo && userInfo.userId;
    // dispatch({
    //   type: 'user/saveCurrentUser',
    //   payload: userInfo
    // })
    // this.setState({
    //   isReady: true,
    //   userInfo,
    //   isLogin
    // });
    // if (dispatch) {
    //   dispatch({
    //     type: 'user/fetchCurrent',
    //   });
    // }
  }

  render() {
    const { children } = this.props;
    // const { isReady,userInfo,isLogin } = this.state;
    // const { children, loading, currentUser,dispatch } = this.props; // You can replace it to your authentication rule (such as check token exists)
    // // 你可以把它替换成你自己的登录认证规则（比如判断 token 是否存在）
    // // const isLogin = currentUser && currentUser.userName;

    // const queryString = stringify({
    //   redirect: window.location.href,
    // });
    // // console.log(isLogin);
    // if ((!isLogin && loading) || !isReady) {
    //   return <PageLoading />;
    // }

    // // console.log(window.location.host);

    // if (!isLogin && window.location.pathname !== '/user/login') {
    //   // return <Redirect to={`/user/login?${queryString}`} />;
    //   location.href = 'http://localhost:8000/#/user/login';
    //   // return <Redirect to={`/user/login`} />;
    // }

    return children;
  }
}

export default connect(({ user, loading }) => ({
  currentUser: user.currentUser,
  loading: loading.models.user,
}))(SecurityLayout);
