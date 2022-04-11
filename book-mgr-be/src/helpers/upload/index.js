const fs = require('fs');

// 参数2，保存文件到硬盘，该文件必须要有个文件名
const saveFileToDisk = (ctx, filename) => {
  return new Promise((resolve, reject) => {
    // 拿到文件，放到file当中
    const file = ctx.request.files.file;
    // 读方法 ——> file.path是上传过来的文件路径中，去把上传文件一点点读进来
    const reader = fs.createReadStream(file.path);
    // 写方法 ——> 读进来后，再一点点写到硬盘的filename文件上，filename是上传的文件夹名
    const writeStream = fs.createWriteStream(filename);
    // 边读边写
    reader.pipe(writeStream);
    // 读取结束后，关掉
    reader.on('end', () => {
      resolve(filename);
    });
    // 读取错误后，报错
    reader.on('error', (err) => {
      reject(err);
    });
  });
};

// 获取文件后缀的方法
const getUploadFileExt = (ctx) => {
  // 获取上传文件的文件名
  const { name = '' } = ctx.request.files.file;
  // 分割文件名，pop方法获取最后一项
  return name.split('.').pop();
};

module.exports = {
  saveFileToDisk,
  getUploadFileExt,
};
