const jwt = require('jsonwebtoken');
const config = require('../../project.config');
const koaJwt = require('koa-jwt');
const mongoose = require('mongoose');

const User = mongoose.model('User');

// 获取token！
const getToken = (ctx) => {
  let { authorization } = ctx.header;

  return authorization.replace('Bearer ', '').replace('bearer ', '');
};

const verify = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.JWT_SECRET, (err, payload) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(payload);
    });
  });
};

// 中间件,来校验token是否正确!
const middleware = (app) => {
  app.use(koaJwt({
    secret: config.JWT_SECRET,
  }).unless({
    path: [
      /^\/auth\/login/,
      /^\/auth\/register/,
      /^\/forget-password\/add/,
    ],
  }));
};

const res401 = (ctx) => {
  ctx.status = 401;
  ctx.body = {
    code: 0,
    msg: '用户校验失败',
  };
};

// 中间件,token校验完成后,还要自己判断该用户是否还处于登录状态,若是,继续进行其它操作   
const checkUser = async (ctx, next) => {
  const { path } = ctx;
  // 如果是以下几个页面,就不用做校验
  if (path === '/auth/login' || path === '/auth/register' || path === '/forget-password/add') {
    await next();
    return;
  }

  // 获取用户信息
  const { _id, account, character } = await verify(getToken(ctx));

  const user = await User.findOne({
    _id,
  }).exec();

  if (!user) {
    res401(ctx);
    return;
  }

  if (account !== user.account) {
    res401(ctx);
    return;
  }

  if (character !== user.character) {
    res401(ctx);
    return;
  }

  await next();
};

// 中间件,捕捉token解析错误的时候 
const catchTokenError = async (ctx, next) => {
  return next().catch((error) => {
    if (error.status === 401) {
      ctx.status = 401;

      ctx.body = {
        code: 0,
        msg: 'token error',
      };
    } else {
      throw error;
    }
  });
};

module.exports = {
  verify,
  getToken,
  middleware,
  catchTokenError,
  checkUser,
};
