const Router = require('@koa/router');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const config = require('../../project.config');
const { verify, getToken } = require('../../helpers/token');

const User = mongoose.model('User');

const router = new Router({
  prefix: '/profile',
});
// 修改密码
router.post('/update/password', async (ctx) => {
  const {
    password,
    oldPassword,
  } = ctx.request.body;

  // 通过token获取用户的id
  const payload = await verify(getToken(ctx));
  const { _id } = payload;

  // 是否有该用户
  const user = await User.findOne({
    _id,
  }).exec();

  if (!user) {
    ctx.body = {
      msg: '用户不存在',
      code: 0,
    };
    return;
  }

  // 旧密码是否正确
  if (user.password !== oldPassword) {
    ctx.body = {
      msg: '密码校验失败',
      code: 0,
    };
    return;
  }

  // 修改密码
  user.password = password;

  await user.save();

  ctx.body = {
    msg: '修改成功',
    code: 1,
  };
});

module.exports = router;
