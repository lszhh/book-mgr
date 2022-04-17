import { createRouter, createWebHashHistory } from 'vue-router';
import { user } from '@/service';
import store from '@/store';
import { message } from 'ant-design-vue';

const routes = [
  {
    path: '/auth',
    name: 'Auth',
    // 异步渲染的方式，只有在加载about时候才会把文件从远端拿下来执行，基础写法是 component: about,
    component: () => import(/* webpackChunkName: "auth" */ '../views/Auth/index.vue'),
  },
  {
    path: '/',
    name: 'BasicLayout',
    // 如果是跳转到'/',就直接跳转到auth界面,退出的操作
    redirect: '/auth',
    component: () => import(/* webpackChunkName: "BasicLayout" */ '../layout/BasicLayout/index.vue'),
    // 嵌套路由
    children: [
      {
        path: 'books',
        name: 'Books',
        component: () => import(/* webpackChunkName: "Books" */ '../views/Books/index.vue'),
      },
      {
        path: 'books/:id',
        name: 'BookDetail',
        component: () => import(/* webpackChunkName: "BookDetail" */ '../views/BookDetail/index.vue'),
      },
      {
        path: 'user',
        name: 'User',
        component: () => import(/* webpackChunkName: "User" */ '../views/Users/index.vue'),
      },
      {
        path: 'log',
        name: 'Log',
        component: () => import(/* webpackChunkName: "Log" */ '../views/Log/index.vue'),
      },
      {
        path: 'reset/password',
        name: 'ResetPassword',
        component: () => import(/* webpackChunkName: "ResetPassword" */ '../views/ResetPassword/index.vue'),
      },
      {
        path: 'invite-code',
        name: 'InviteCode',
        component: () => import(/* webpackChunkName: "InviteCode" */ '../views/InviteCode/index.vue'),
      },
      {
        path: 'book-classify',
        name: 'BookClassify',
        component: () => import(/* webpackChunkName: "BookClassify" */ '../views/BookClassify/index.vue'),
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import(/* webpackChunkName: "Profile" */ '../views/Profile/index.vue'),
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import(/* webpackChunkName: "Dashboard" */ '../views/Dashboard/index.vue'),
      },
      {
        path: 'out-input',
        name: 'OutInput',
        component: () => import(/* webpackChunkName: "outInput" */ '../views/OutInput/index.vue')
      }
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});


router.beforeEach(async (to, from, next) => {
  let res = {};

  try {
    res = await user.info();
  } catch (e) {
    if (e.message.includes('code 401')) {
      res.code = 401;
    }
  }

  const { code } = res;

  // 如果没有token
  if (code === 401) {
    // 如果要去的时候auth界面
    if (to.path === '/auth') {
      // 让它去该界面,进行登录,避免白屏
      next();
      return;
    }

    // 否则,提示信息,跳转到auth界面
    message.error('认证失败，请重新登入');
    next('/auth');

    return;
  }

  if (!store.state.characterInfo.length) {
    // 获取角色信息
    await store.dispatch('getCharacterInfo');
  }

  const reqArr = [];

  if (!store.state.userInfo.account) {
    reqArr.push(store.dispatch('getUserInfo'));
  }

  if (!store.state.bookClassify.length) {
    reqArr.push(store.dispatch('getBookClassify'));
  }

  // 解决已经出页面，但是store.dispatch还没执行完，界面显示隐藏不合理的问题！
  // Promise.all接收一个数组，这个数组全是promise，当该数组里面所有都resolove之后
  // 再去next()，做接下来的事情，保证界面能全部渲染OK
  await Promise.all(reqArr);

  // 以上全部执行完了,说明是登录OK了,有信息了,直接跳到good页面
  if (to.path === '/auth') {
    next('/books');
    return;
  }

  next();
});

export default router;
