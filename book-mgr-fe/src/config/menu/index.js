import _ from '../common';

export default [
  {
    title: '总览',
    url: '/dashboard',
    onlyAdmin: true,
  },
  {
    title: '统计报表',
    url: '/out-input',
    onlyAdmin: true,
  },
  {
    title: `${_.KEYWORD}管理`,
    url: '/books',
    onlyAdmin: false,
  },
  {
    title: '用户管理',
    url: '/user',
    onlyAdmin: true,
  },
  {
    title: '操作日志',
    url: '/log',
    onlyAdmin: true,
  },
  {
    title: '小项功能',
    onlyAdmin: false,
    children: [
      {
        title: `${_.KEYWORD}分类管理`,
        url: '/book-classify',
        onlyAdmin: true,
      },
      {
        title: '重制密码列表',
        url: '/reset/password',
        onlyAdmin: true,
      },
      {
        title: '邀请码管理',
        url: '/invite-code',
        onlyAdmin: true,
      },
    ],
  },
  {
    title: '个人设置',
    url: '/profile',
    onlyAdmin: false,
  },
];
