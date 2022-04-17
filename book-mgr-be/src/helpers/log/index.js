const { verify, getToken } = require('../token');
const mongoose = require('mongoose');

const Log = mongoose.model('Log');
const LogResponse = mongoose.model('LogResponse');

// 记录日志的中间件！
const logMiddleware = async (ctx, next) => {
  // 记录请求进来时间
  const startTime = Date.now();

  await next();

  // 拿到token，并解析，获取用户信息
  // 可能会解析失败，所以用try-catch来处理异常！
  let payload = {};
  try {
    payload = await verify(getToken(ctx));
  } catch (e) {
    payload = {
      account: '未知用户',
      id: '',
    };
  }

  // 获取url、请求方法、状态码
  const url = ctx.url;
  const method = ctx.method;
  const status = ctx.status;
  
  // 动作显示隐藏的标记
  let show = true;

  // 隐藏日志组件中发起删除请求的操作
  if (url === '/log/delete') {
    show = false;
  }

  // 获取ctx.body，数据类型可能不一样，需要判断并处理
  let responseBody = '';

  if (typeof ctx.body === 'string') {
    responseBody = ctx.body;
  } else {
    try {
      // 转换成json字符串
      responseBody = JSON.stringify(ctx.body);
    } catch {
      responseBody = '';
    }
  }

  // 记录请求结束时间
  const endTime = Date.now();

  // 构建获取到的数据
  const log = new Log({
    user: {
      account: payload.account,
      id: payload.id,
    },
    request: {
      url,
      method,
      status,
    },

    endTime,
    startTime,
    show,
  });

  // 将获取的数据保存进数据库
  log.save();

  // 直接存res的内容太多，数据库会报错，重新建立个Schema
  // 来存储response的内容
  const logRes = new LogResponse({
    logId: log._id,
    data: responseBody,
    startTime,
    url,
  });

  logRes.save();
};

module.exports = {
  logMiddleware,
};
