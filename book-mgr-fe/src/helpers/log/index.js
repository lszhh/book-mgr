const LOG_MAP = [
  ['/character/list', '获取角色列表'],
  ['/log/list', '获取日志列表'],
  ['/user/info', '获取自己的登入信息'],
  ['/book/list', '获取书籍列表'],
  ['/book/getStore','读取存量'],
  ['/user/list', '获取用户列表'],
  ['/invite/list','获取邀请码列表'],
  ['/inventory-log/getSaleValue','获取日志列表'],
  ['/forget-password/list','获取重置密码列表'],
  ['/inventory-log/list','获取出入库列表'],
  ['/book/detail','查看书籍详情'],
  ['/book-classify/list','获取书籍分类列表'],
  ['/dashboard/base-info','获取总览页信息'],
  ['/book/add','添加用户'],
];

export const getLogInfoByPath = (path) => {
  let title = '';

  // 遍历列表
  LOG_MAP.forEach((item) => {
    // includes方法，找到与否，返回布尔值！
    if (path.includes(item[0])) {
      title = path.replace(item[0], item[1]);
    }
  });

  return title || path;
};
