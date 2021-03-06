const Router = require('@koa/router');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const _ = require('../../config/common');

const BookClassify = mongoose.model('BookClassify');

const router = new Router({
  prefix: '/book-classify',
});

router.get('/list', async (ctx) => {
  const list = await BookClassify.find().sort({
    _id: -1,
  }).exec();

  ctx.body = {
    data: list,
    code: 1,
    msg: '获取图书分类列表成功',
  };
});

// 添加分类
router.post('/add', async (ctx) => {
  const {
    title,
  } = ctx.request.body;

  const one = await BookClassify.findOne({
    title,
  }).exec();

  if (one) {
    ctx.body = {
      code: 0,
      msg: `${_.KEYWORD}分类已经存在`,
    };
    return;
  }

  if (title === '') {
    ctx.body = {
      code: 0,
      msg: '分类不能为空',
    };
    return;
  }

  const bookClassify = new BookClassify({
    title,
  });

  const saved = await bookClassify.save();

  ctx.body = {
    data: saved,
    code: 1,
    msg: '分类创建成功',
  }
});

router.delete('/:id', async (ctx) => {
  const {
    id,
  } = ctx.params;

  const one = await BookClassify.findOne({
    _id: id,
  }).exec();

  const res = await BookClassify.deleteOne({
    _id: id,
  });

  ctx.body = {
    data: res,
    code: 1,
    msg: '分类删除成功',
    classifyName: one.title,
  };
});

router.post('/update/title', async (ctx) => {
  const {
    id,
    title,
  } = ctx.request.body;

  const one = await BookClassify.findOne({
    _id: id,
  });

  if (!one) {
    ctx.body = {
      msg: '该分类不存在',
      code: 0,
    };
    return;
  }

  one.title = title;

  const res = await one.save();

  ctx.body = {
    data: res,
    msg: '分类修改成功',
    code: 1,
  };
});

module.exports = router;
