const path = require('path');

module.exports = {
  // 重置密码的默认配置
  DEFAULT_PASSWORD: '123123',
  // 加密解密的默认配置
  JWT_SECRET: 'book-mgr',
  UPLOAD_DIR: path.resolve(__dirname, '../upload'),

  SERVER_PORT: 3000,
};
