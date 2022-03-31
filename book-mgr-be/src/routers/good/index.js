const Router = require('@koa/router');
const mongoose = require('mongoose');
const config = require('../../project.config');
const { getBody } = require('../../helpers/utils');
const { loadExcel, getFirstSheet } = require('../../helpers/excel');
const _ = require('../../config/common');
const { verify, getToken } = require('../../helpers/token')

// 出库入库常量
const GOOD_COUST = {
  IN: 'IN_COUNT',
  OUT: 'OUT_COUNT',
}

const Good = mongoose.model('Good');
const InventoryLog = mongoose.model('InventoryLog');
// 获取分类表
const Classify = mongoose.model('GoodClassify')

const findGoodOne = async (id) => {
  const one = await Good.findOne({
    _id: id,
  }).exec();

  return one;
};

const router = new Router({
  prefix: '/good',
});

// 列出商品接口
router.get('/list', async (ctx) => {
  // query 为地址 ?page=2&size=20 这些
  const {
    page = 1,
    keyword = '',
    // 这个是可视化所查询需要的id
    _id,
  } = ctx.query

  let {
    size
  } = ctx.query
  // 转为数字
  size = Number(size)
  // 如果keyword不为空
  let query = {}

  // 如果_id不为空
  if (_id) {
    query.classify = _id
  }
  if (keyword) {
    query.name = keyword
  }

  // 列出库存不为0的商品
  query.count = { $gt: 0 }

  const list = await Good
    // find可以接收一个对象 按照对象里面给的属性当做条件去查找数据
    .find(query)
    .sort({
      // 倒序
      _id: -1,
    })
    // 跳过几页 共几条数据
    .skip((page - 1) * size)
    // 查询几条数据
    .limit(size)
    .exec()

  // 获取商品数量
  const total = await Good.countDocuments();

  ctx.response.body = {
    code: 1,
    msg: '列出商品成功',
    data: {
      list,
      total,
      page,
      size,
    }
  }
})

router.delete('/:id', async (ctx) => {
  const {
    id,
  } = ctx.params;

  const delMsg = await Good.deleteOne({
    _id: id,
  });

  ctx.body = {
    data: delMsg,
    msg: '删除成功',
    code: 1,
  };
});

// 增加和减少库存接口
router.post('/update/count', async (ctx) => {
  const {
    id,
    type,
  } = getBody(ctx)

  // 获取到输入的库存数量
  let {
    num,
  } = getBody(ctx)

  num = Number(num)

  const good = await Good.findOne({
    _id: id
  }).exec()

  if (!good) {
    ctx.body = {
      code: 0,
      msg: '没有找到相关商品',
    }
    return
  }

  // 如果找到了商品
  if (type === GOOD_COUST.IN) {
    // 入库操作
    num = Math.abs(num)
  } else {
    // 出库操作
    num = -Math.abs(num)
  }

  good.count += num;

  // 如果库存为负数
  if (good.count < 0) {
    ctx.body = {
      code: 0,
      msg: '商品库存不足',
    }
    return
  }

  const res = await good.save()

  // 获取操作者
  const { account } = await verify(getToken(ctx))

  // 更新出入库记录
  const log = new InventoryLog({
    type,
    num: Math.abs(num),
    goodName: id,
    user: account,
  })

  log.save()

  ctx.body = {
    code: 1,
    msg: '进出库操作成功',
    data: res,
  }

})

router.post('/update', async (ctx) => {
  const {
    id,
    ...others
  } = ctx.request.body;

  const one = await findGoodOne(id);

  // 没有找到书
  if (!one) {
    ctx.body = {
      msg: `没有找到${_.KEYWORD}`,
      code: 0,
    }
    return;
  }

  const newQuery = {};

  Object.entries(others).forEach(([key, value]) => {
    if (value) {
      newQuery[key] = value;
    }
  });

  Object.assign(one, newQuery);

  const res = await one.save();

  ctx.body = {
    data: res,
    code: 1,
    msg: '保存成功',
  };
});

router.get('/detail/:id', async (ctx) => {
  const {
    id,
  } = ctx.params;

  const one = await findGoodOne(id);

  // 没有找到书
  if (!one) {
    ctx.body = {
      msg: `没有找到${_.KEYWORD}`,
      code: 0,
    };

    return;
  }

  ctx.body = {
    msg: '查询成功',
    data: one,
    code: 1,
  };
});

router.post('/addMany', async (ctx) => {
  const {
    key = '',
  } = ctx.request.body;

  const path = `${config.UPLOAD_DIR}/${key}`;

  const excel = loadExcel(path);

  const sheet = getFirstSheet(excel);

  const arr = [];
  for (let i = 0; i < sheet.length; i++) {
    let record = sheet[i];

    const [
      name,
      price,
      producedDate,
      expirationDate,
      classify,
      count,
    ] = record;

    let classifyId = classify;

    const one = await Classify.findOne({
      title: classify,
    });

    if (one) {
      classifyId = one._id;
    }

    arr.push({
      name,
      price,
      producedDate,
      expirationDate,
      classify: classifyId,
      count,
    });
  }

  await Good.insertMany(arr);

  ctx.body = {
    code: 1,
    msg: '添加成功',
    data: {
      addCount: arr.length,
    },
  };
});

router.post('/add', async (ctx) => {
  const {
    name,
    price,
    producedDate,
    expirationDate,
    classify,
    count,
  } = getBody(ctx);

  const good = new Good({
    name,
    price,
    expirationDate,
    producedDate,
    classify,
    count,
  });

  const res = await good.save();

  ctx.body = {
    data: res,
    code: 1,
    msg: '添加成功',
  };
});

// 获取分类库存信息
router.get('/getStore', async (ctx) => {

  // 最终返回一个数组
  const result = []

  // 获取全部商品
  const res = await Good.find()
  // 获取分类数量
  const classify = await Classify
    .find()
    .sort({
      _id: -1
    })
    .exec()

  // 获取各个分类商品的总数
  classify.forEach(classifyItem => {
    let total = 0
    res.forEach(resItem => {
      if (classifyItem._id == resItem.classify) {
        total += resItem.count
      }
    })
    result.push(total)
  })

  ctx.body = {
    code: 1,
    msg: '获取库存信息成功',
    data: result,
  }
})

module.exports = router;
