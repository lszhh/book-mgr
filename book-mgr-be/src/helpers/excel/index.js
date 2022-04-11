const xlsx = require('node-xlsx');

// 解析传递过来的excel！
const loadExcel = (path) => {
  return xlsx.parse(path);
};

// 获得第一张表数据
const getFirstSheet = (sheets) => {
  return sheets[0].data;
};

module.exports = {
  loadExcel,
  getFirstSheet,
};
