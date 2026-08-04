// eslint-disable-next-line import/no-extraneous-dependencies
function getFakeCaptcha(req, res) {
  return res.json('captcha-xxx');
}

export default {
  'POST  /api/login/account': (req, res) => {
    // const { password, userName, type } = req.body;
    const { password, userName, type } = req.body;

    if (password === 'ant.design' && userName === 'admin') {
      res.send({
        status: 'ok',
        type,
        currentAuthority: 'admin',
      });
      return;
    }

    if (password === 'ant.design' && userName === 'user') {
      res.send({
        status: 'ok',
        type,
        currentAuthority: 'user',
      });
      return;
    }

    if (type === 'mobile') {
      res.send({
        status: 'ok',
        type,
        currentAuthority: 'admin',
      });
      return;
    }

    res.send({
      status: 'error',
      type,
      currentAuthority: 'guest',
    });
  },
  'GET  /api/login/captcha': getFakeCaptcha,
  'POST  /api/login': (req, res) => {
    const { password, username, type } = req.body;

    if (password === '123' && username === 'admin') {
      res.send({
        // status: 'ok',
        // currentAuthority: 'admin',
        code: '1',
        message: '',
        data: {
          userName: '管理员',
          uid: 'admin'
        }
      });
      return;
    }

    if (password === 'ant.design' && username === 'user') {
      res.send({
        status: 'ok',
        currentAuthority: 'user',
      });
      return;
    }

    res.send({
        code: '-1',
        message: '',
        data: {}
    });
  },
  'GET  /api/login': getFakeCaptcha,
};
