const Router = require('@koa/router');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const InviteCode = mongoose.model('InviteCode');

const router = new Router({
  prefix: '/invite',
});

router.post('/add', async (ctx) => {
  // 接收变量，创建几条
  const {
    // 这里是默认为1，若有其它数字，就更改为别的数字
    count = 1,
  } = ctx.request.body;

  // 循环创建多个邀请码
  const arr = [];

  for (let i = 0; i < count; i++) {
    arr.push({
      code: uuidv4(),
      user: '',
    });
  }

  // 往数据库插入多条记录
  const res = await InviteCode.insertMany(arr);

  ctx.body = {
    code: 1,
    data: res,
    msg: '多条邀请码插入成功',
  };
});

// 获取列表接口
router.get('/list', async (ctx) => {
  let {
    page,
    size,
  } = ctx.request.query;

  page = Number(page);
  size = Number(size);

  const list = await InviteCode
    .find()
    .sort({
      _id: -1,
    })
    .skip((page - 1) * size)
    .limit(size)
    .exec();

  const total = await InviteCode.countDocuments();

  ctx.body = {
    data: {
      list,
      total,
      page,
      size,
    },
    msg: '邀请码列表获取成功',
    code: 1,
  };
});

// 删除接口
router.delete('/:id', async (ctx) => {
  const {
    id,
  } = ctx.params;

  const one = await InviteCode.findOne({
    _id: id,
  }).exec();

  const res = await InviteCode.deleteOne({
    _id: id,
  });

  
  ctx.body = {
    data: res,
    msg: '邀请码删除成功',
    code: 1,
    codeName: one.code,
  };
});

module.exports = router;
