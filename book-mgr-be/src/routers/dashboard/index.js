const Router = require('@koa/router');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const config  = require('../../project.config');

// 获取三个模型
const User = mongoose.model('User');
const Good = mongoose.model('Good');
const Log = mongoose.model('Log');

const router = new Router({
  prefix: '/dashboard',
});

// 获取基本信息接口
router.get('/base-info', async (ctx) => {
  // 查询总数
  const goodTotal = await Good.countDocuments();
  const userTotal = await User.countDocuments();
  // 显示的数据才算！
  const logTotal = await Log.find({ show: true }).countDocuments();

  ctx.body = {
    code: 1,
    msg: '获取成功',
    data: {
      total: {
        good: goodTotal,
        user: userTotal,
        log: logTotal,
      },
    },
  };
});

module.exports = router;
