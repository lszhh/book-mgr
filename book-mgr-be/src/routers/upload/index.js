const Router = require('@koa/router');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const config = require('../../project.config');
const { verify, getToken } = require('../../helpers/token');
const { saveFileToDisk, getUploadFileExt } = require('../../helpers/upload');
const path = require('path');


const User = mongoose.model('User');
const Character = mongoose.model('Character');

const router = new Router({
  prefix: '/upload',
});

// 上传文件接口，先生成文件名，再保存到硬盘！
router.post('/file', async (ctx) => {
  // 获取后缀
  const ext = getUploadFileExt(ctx);
  // 服务端的文件名为 uuid随机生成 + 后缀，这样就避免把文件名写死
  // 大家都是1.xlsx了！
  const filename = `${uuidv4()}.${ext}`;
  // 文件从前端发过来后，把文件写到硬盘中去保存！
  await saveFileToDisk(
    // path.resolve方法，用于合并路径！
    ctx, path.resolve(config.UPLOAD_DIR, filename)
  );

  ctx.body = {
    data: filename,
    msg: '',
    code: 1,
  };
});

module.exports = router;
