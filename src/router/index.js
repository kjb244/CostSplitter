import Vue from 'vue'
import Router from 'vue-router'
import UserInit from '@/components/UserInit'
import Calculate from '@/components/Calculate'
import Splash from '@/components/Splash'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'splash',
      component: Splash
    },
    {
      path: '/calculate',
      name: 'calculate',
      component: Calculate
    },
    {
      path: '/users',
      name: 'UserInit',
      component: UserInit
    },
  ]
})
