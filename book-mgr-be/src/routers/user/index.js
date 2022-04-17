const Router = require('@koa/router');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const config = require('../../project.config');
const { verify, getToken } = require('../../helpers/token');
const { loadExcel, getFirstSheet } = require('../../helpers/excel');

// const { getBody } = require('../../helpers/utils');
const User = mongoose.model('User');
const Character = mongoose.model('Character');

const router = new Router({
  prefix: '/user',
});

// 获取用户列表数据
router.get('/list', async (ctx) => {
  let {
    page,
    size,
    keyword,
  } = ctx.query;

  page = Number(page);
  size = Number(size);

  const query = {};

  if (keyword) {
    query.account = keyword;
  }
// list常量接收查询到的数据
  const list = await User
    .find(query)
    .sort({
      _id: -1,
    })
    .skip((page - 1) * size)
    .limit(size)
    .exec();

  const total = await User.countDocuments().exec();

  ctx.body = {
    msg: '获取用户列表成功',
    data: {
      list,
      page,
      size,
      total,
    },
    code: 1,
  };
});

// 删除用户
router.delete('/:id', async (ctx) => {
  const {
    id,
  } = ctx.params;

  const user = await User.findOne({
    _id: id,
  }).exec();

  const delMsg = await User.deleteOne({
    _id: id,
  });

  ctx.body = {
    data: delMsg,
    code: 1,
    msg: '用户删除成功',
    userName: user.account,
  };
});

// 增加用户
router.post('/add', async (ctx) => {
  const {
    account,
    password,
    character,
  } = ctx.request.body;

  const char = await Character.findOne({
    _id: character,
  });

  if (!char) {
    ctx.body = {
      msg: '出错啦',
      code: 0,
    };

    return;
  }

  const user = new User({
    account,
    password: password || '123123',
    character,
  });

  const res = await user.save()

  ctx.body = {
    data: res,
    code: 1,
    msg: '用户添加成功',
  };
});

// 重置密码
router.post('/reset/password', async (ctx) => {
  const {
    id,
  } = ctx.request.body;

  const user = await User.findOne({
    _id: id,
  }).exec();

  if (!user) {
    ctx.body = {
      msg: '找不到用户',
      code: 0,
    };

    return;
  }

  // 默认配置项，重置后的密码均为123123
  user.password = config.DEFAULT_PASSWORD;

  // 保存密码的更改
  const res = await user.save();

  ctx.body = {
    msg: '用户重置密码成功',
    data: {
      account: res.account,
      _id: res._id,
    },
    code: 1,
  };
});

// 修改角色
router.post('/update/character', async (ctx) => {
  const {
    character,
    userId,
  } = ctx.request.body;
  // 查找角色是否存在
  const char = await Character.findOne({
    _id: character,
  });

  if (!char) {
    ctx.body = {
      msg: '出错啦',
      code: 0,
    };

    return;
  }
  // 查找用户是否存在
  const user = await User.findOne({
    _id: userId,
  });

  if (!user) {
    ctx.body = {
      msg: '出错啦',
      code: 0,
    };

    return;
  };
  // 更改用户角色
  user.character = character;

  const res = await user.save();

  ctx.body = {
    data: res,
    code: 1,
    msg: '用户角色修改成功',
  };
});

// 通过token获取用户信息
router.get('/info', async (ctx) => {
  ctx.body = {
    // token保存了用户的信息,解密后返回给前端使用!
    data: await verify(getToken(ctx)),
    code: 1,
    msg: 'token信息获取成功',
  }
});

// excel批量添加用户接口
router.post('/addMany', async (ctx) => {
  const {
    key = '',
  } = ctx.request.body;

  // 文件路径
  const path = `${config.UPLOAD_DIR}/${key}`;

  // 解析excel
  const excel = loadExcel(path);

  // 获得解析后的excel，从中获取第一张表的数据
  const sheet = getFirstSheet(excel);

  // 全部用户默认为成员
  const character = await Character.find().exec();
  const member = character.find((item) => (item.name === 'member'));

  // 构建列表,循环该列表每一列的数据,比如账户,密码等,取出来用!
  const arr = [];
  // 循环遍历表里的每一行数据
  for (let i = 0; i < sheet.length; i++) {
    // 赋值给record
    let record = sheet[i];
    // 取出数据
    const [account, password = config.DEFAULT_PASSWORD] = record;

    // 看用户在不在
    const one = await User.findOne({
      account,
    })

    if (one) {
      // 若在跳出本次循环,进行下一行数据的获取
      continue;
    }

    // 把数据推进数组
    arr.push({
      account,
      password,
      character: member._id,
    });
  }

  // 同时插入多条数据添加用户
  await User.insertMany(arr);

  ctx.body = {
    code: 1,
    msg: 'Excel批量添加用户成功',
    data: {
      addCount: arr.length,
    },
  };
});

module.exports = router;
