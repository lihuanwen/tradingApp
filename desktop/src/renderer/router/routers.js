import error from './error';
import user from './user';

export default [
  {
    path: '/login',
    name: 'login',
    meta: {
      title: '登录',
      hideInMenu: true,
      dispark: true
    },
    component: () => import('@/view/AUC/login.vue')
  },
  {
    path: '/register',
    name: 'register',
    meta: {
      title: '注册',
      hideInMenu: true,
      dispark: true
    },
    component: () => import('@/view/AUC/register.vue')
  },
  ...error,
  ...user
];
