import Vue from 'vue'

import Router from 'vue-router'
import store from '@/store'

import iView from 'iview'
import { canTurnTo } from '@/libs/util'

import routers from './routers'
Vue.use(Router)

const router = new Router({
  // mode: 'history',
  routes: routers
})

router.beforeEach((to, from, next) => {
  iView.LoadingBar.start()
  // if (!to.name) {
  //   router.replace({
  //     path: '/404'
  //   })
  // } else if (to.meta.requireAuth != false && !store.getters.login) {
  //   router.replace({
  //     path: '/login',
  //     query: {
  //       replace: to.fullPath != '/' ? to.fullPath : '/'
  //     }
  //   })
  // } else {
  //   next()
  // }

  if (to.meta.dispark) {
    next()
  } else {
    if (
      store.state.user.token &&
      canTurnTo(to.name, store.state.user.userInfo.access, routers)
    ) {
      next()
    } else {
      // next({ replace: true, name: 'error_401' })
      next({
        replace: true,
        name: 'login',
        query: {
          replace: to.fullPath != '/' ? to.fullPath : '/'
        }
      })
    }
  }

  // if (!token && to.name !== LOGIN_PAGE_NAME) {
  //   // 未登录且要跳转的页面不是登录页
  //   next({
  //     name: LOGIN_PAGE_NAME
  //   })
  // } else if (!token && to.name === LOGIN_PAGE_NAME) {
  //   // 未登陆且要跳转的页面是登录页
  //   next()
  // } else if (token && to.name === LOGIN_PAGE_NAME) {
  //   // 已登录且要跳转的页面是登录页
  //   next({
  //     name: 'home'
  //   })
  // } else {
  //   if (canTurnTo(to.name, store.state.user.access, routers)) {
  //     next()
  //   } else {
  //     next({ replace: true, name: 'error_401' })
  //   }
  // }
})

router.afterEach(to => {
  iView.LoadingBar.finish()
  window.scrollTo(0, 0)
})

export default router
