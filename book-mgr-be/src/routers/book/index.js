const Router = require('@koa/router');
const mongoose = require('mongoose');
const config = require('../../project.config');
const { getBody } = require('../../helpers/utils');
const { loadExcel, getFirstSheet } = require('../../helpers/excel');
const _ = require('../../config/common');
const { verify, getToken } = require('../../helpers/token')

// 出库入库常量
const BOOK_COUST = {
  IN: 'IN_COUNT',
  OUT: 'OUT_COUNT',
}

const Book = mongoose.model('Book');
const InventoryLog = mongoose.model('InventoryLog');
// 获取分类表
const Classify = mongoose.model('BookClassify')

// 把查找书籍封装成函数
const findBookOne = async (id) => {
  const one = await Book.findOne({
    _id: id,
  }).exec();

  return one;
};

const router = new Router({
  prefix: '/book',
});

// 列出书籍接口
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
  // 用于检索书籍的keyword 
  if (keyword) {
    query.name = keyword
  }

  // 列出库存不为0的商品
  query.count = { $gt: 0 }

  const list = await Book
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
  const total = await Book.countDocuments();

  ctx.response.body = {
    code: 1,
    msg: '列出书籍列表成功',
    data: {
      list,
      total,
      page,
      size,
    }
  }
})

// 编写删除接口
router.delete('/:id', async (ctx) => {
  const {
    id,
  } = ctx.params;

  const one = await findBookOne(id);


  const delMsg = await Book.deleteOne({
    _id: id,
  });

  ctx.body = {
    data: delMsg,
    msg: '删除书籍成功',
    code: 1,
    bookName: one.name,
  };
});

// 增加和减少库存接口
router.post('/update/count', async (ctx) => {
  const {
    id,
    // 出库还是入库的标记
    type,
  } = getBody(ctx)

  // 获取到输入的库存数量
  let {
    num,
  } = getBody(ctx)

  num = Number(num)

  // 出库入库中，查找书籍
  const book = await Book.findOne({
    _id: id
  }).exec()

  if (!book) {
    ctx.body = {
      code: 0,
      msg: '没有找到相关书籍',
    }
    return
  }

  // 如果找到了书籍
  if (type === BOOK_COUST.IN) {
    // 入库操作
    num = Math.abs(num)
  } else {
    // 出库操作
    num = -Math.abs(num)
  }

  // 改变count的值
  book.count += num;

  // 如果存量为负数
  if (book.count < 0) {
    ctx.body = {
      code: 0,
      msg: '书籍存量不足',
    }
    return
  }

  // 同步修改到数据库
  const res = await book.save()

  // 获取操作者
  const { account } = await verify(getToken(ctx))

  // 更新出入库记录
  const log = new InventoryLog({
    type,
    num: Math.abs(num),
    bookName: id,
    user: account,
  })

  log.save()

  ctx.body = {
    code: 1,
    msg: '进出库操作成功',
    data: res,
  }

})

// 修改图书
router.post('/update', async (ctx) => {
  const {
    id,
    ...others
  } = ctx.request.body;

  const one = await findBookOne(id);

  
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
    AfterData: res,
    code: 1,
    msg: '书籍修改成功',
  };
});

// 详情页获取数据的接口
router.get('/detail/:id', async (ctx) => {
  const {
    id,
  } = ctx.params;

  const one = await findBookOne(id);

  // 没有找到书
  if (!one) {
    ctx.body = {
      msg: `没有找到${_.KEYWORD}`,
      code: 0,
    };

    return;
  }

  ctx.body = {
    msg: '详情页查询书籍成功',
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
  
    // let PRODUCEDATE = producedDate.valueOf();
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

  await Book.insertMany(arr);

  ctx.body = {
    code: 1,
    msg: 'Excel批量添加图书成功',
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

  const book = new Book({
    name,
    price,
    expirationDate,
    producedDate,
    classify,
    count,
  });

  const res = await book.save();

  ctx.body = {
    data: res,
    code: 1,
    msg: '添加一本图书成功',
    bookName: name,
  };
});

// 获取分类库存信息
router.get('/getStore', async (ctx) => {

  // 最终返回一个数组
  const result = []

  // 获取全部商品
  const res = await Book.find()
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
