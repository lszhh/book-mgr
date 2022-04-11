const Router = require('@koa/router');
const mongoose = require('mongoose');
const { getBody } = require('../../helpers/utils');
const jwt = require('jsonwebtoken');
const config = require('../../project.config');

// 拿到User和InviteCode的model
const User = mongoose.model('User');
const InviteCode = mongoose.model('InviteCode');

const router = new Router({
  prefix: '/auth',
});

// 此处类似于中间件，请求会匹配到/auth/register，这里的register，就是下面这个，请求进来就进行处理
router.post('/register', async (ctx) => {
  // 接收post提交过来的数据
  const {
    account,
    password,
    inviteCode,
  } = getBody(ctx);

  // 做表单校验
  if (account === '' || password === '' || inviteCode === '') {
    ctx.body = {
      code: 0,
      msg: '字段不能为空',
      data: null,
    };

    return;
  }

  // 找有没有邀请码 ——> 先找有没有邀请码再找有没有用户
  const findCode = await InviteCode.findOne({
    code: inviteCode,
  }).exec();

  // 如果没找到邀请码或者说邀请码已经被使用
  if ((!findCode) || findCode.user) {
    ctx.body = {
      code: 0,
      msg: '邀请码不正确',
      data: null,
    };

    return;
  }

  // 去找 account 为 传递上来的 “account” 的用户
  const findUser = await User.findOne({
    account,
  }).exec();

  // 判断有没有用户
  if (findUser) {
    // 如果有 表示已经存在
    ctx.body = {
      code: 0,
      msg: '已存在该用户',
      data: null,
    };
    return; 
  }

  // 创建一个用户
  const user = new User({
    // 以下account、password，均是前端发送过来的数据，用来创建新用户
    account,
    password,
  });

  // 把创建的用户同步到 mongodb
  const res = await user.save();

  findCode.user = res._id;
  findCode.meta.updatedAt = new Date().getTime();

  await findCode.save();

  // 响应成功
  ctx.body = {
    code: 1,
    msg: '注册成功',
    data: res,
  };
});

router.post('/login', async (ctx) => {
  const {
    account,
    password,
  } = getBody(ctx);

  if (account === '' || password === '') {
    ctx.body = {
      code: 0,
      msg: '字段不能为空',
      data: null,
    };

    return;
  }

  const one = await User.findOne({
    account,
  }).exec();

  if (!one) {
    ctx.body = {
      code: 0,
      msg: '用户名或密码错误',
      data: null,
    };

    return;
  }

  // 把登陆者的信息获取出来
  const user = {
    account: one.account,
    character: one.character,
    _id: one._id,
  };

  if (one.password === password) {
    ctx.body = {
      code: 1,
      msg: '登入成功',
      data: {
        // 返回user的信息
        user,
        // 签发token
        token: jwt.sign(user, config.JWT_SECRET),
      },
    };

    return;
  }

  // 返回一些信息
  ctx.body = {
    code: 0,
    msg: '用户名或密码错误',
    data: null,
  };
});

module.exports = router;
