const Router = require('@koa/router');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const config  = require('../../project.config');

const ForgetPassword = mongoose.model('ForgetPassword');
const User = mongoose.model('User');''

const router = new Router({
  prefix: '/forget-password',
});

// 获取列表
router.get('/list', async (ctx) => {
  let {
    page,
    size,
  } = ctx.request.query;

  page = Number(page);
  size = Number(size);

  const list = await ForgetPassword
    .find({
      status: 1,
    })
    .skip((page - 1) * size)
    .limit(size)
    .exec();

  const total = await ForgetPassword
    .find({
      status: 1,
    })
    .countDocuments().exec();

  ctx.body = {
    data: {
      list,
      page,
      size,
      total,
    },
    code: 1,
    msg: '获取列表成功',
  };
});

// 添加一条重置密码的请求
router.post('/add', async (ctx) => {
  const {
    account,
  } = ctx.request.body;

  // 账户得先存在，才能申请！
  const user = await User.findOne({
    account,
  }).exec();

  if (!user) {
    ctx.body = {
      code: 1,
      msg: '申请成功啦',
    };

    return;
  }

  // 且该账户，在forget-password集合中不存在status为1的文档
  // 即不能重复申请重置密码
  const one = await ForgetPassword.findOne({
    account,
    status: 1,
  }).exec();

  if (one) {
    ctx.body = {
      code: 1,
      msg: '申请成功啦',
    };

    return;
  }

  // 符合要求了，就往数据库添加数据！
  const forgetPwd = new ForgetPassword({
    account,
    status: 1,
  });

  await forgetPwd.save();

  ctx.body = {
    code: 1,
    msg: '申请成功啦',
  };
});

router.post('/update/status', async (ctx) => {
  const {
    id,
    status,
  } = ctx.request.body;

  // 根据id来查找重置密码的请求
  const one = await ForgetPassword.findOne({
    _id: id,
  });

  if (!one) {
    ctx.body = {
      msg: '找不到这条申请',
      code: 0,
    };
    return;
  }

  // 若找到了，就把状态改成我们传上来的status，然后直接save保存
  // 下面的这个判断，是后面加的，还有点不清楚是干嘛的！
  one.status = status;

// 若是传递过来重置，就查找用户，修改密码！
  if (status === 2) {
    const user = await User.findOne({
      account: one.account,
    }).exec();

    if (user) {
      user.password = config.DEFAULT_PASSWORD;

      await user.save();
    }
  }

  await one.save();

  ctx.body = {
    code: 1,
    msg: '处理成功',
  };
});

module.exports = router;
