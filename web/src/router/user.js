import Main from '@/view/main'

/**
 * meta: {
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面不会缓存
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 * }
 */

export default [
  {
    path: '/',
    name: 'setting',
    component: Main,
    redirect: 'settingMarket',
    meta: {
      access: ['user'],
      icon: 'logo-buffer',
      title: '设置'
    },
    children: [
      {
        path: 'settingMarket',
        name: 'settingMarket',
        meta: {
          icon: 'logo-buffer',
          title: '交易所'
        },
        component: () => import('@/view/setting/market')
      }
    ]
  },
  {
    path: '/exchange',
    name: 'exchange',
    component: Main,
    redirect: 'exchangeSymbol',
    meta: {
      access: ['user'],
      icon: 'logo-buffer',
      title: '交易'
    },
    children: [
      {
        path: 'exchangeSymbol',
        name: 'exchangeSymbol',
        meta: {
          icon: 'logo-buffer',
          title: '币币交易'
        },
        component: () => import('@/view/exchange/index')
      }
    ]
  },
  {
    path: '/capital',
    name: 'capital',
    meta: {
      icon: 'logo-buffer',
      title: '资金管理'
    },
    component: Main,
    children: [
      {
        path: 'balance',
        name: 'balance',
        meta: {
          icon: 'md-trending-up',
          title: '我的资产'
        },
        component: () => import('@/view/capital/balance')
      }
    ]
  },
  {
    path: '/order',
    name: 'order',
    meta: {
      icon: 'logo-buffer',
      title: '订单管理'
    },
    component: Main,
    children: [
      {
        path: 'userOrders',
        name: 'userOrders',
        meta: {
          icon: 'md-trending-up',
          title: '订单管理'
        },
        component: () => import('@/view/order/orders')
      }
    ]
  }
]
