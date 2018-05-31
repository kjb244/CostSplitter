import Vue from 'vue'
import Router from 'vue-router'
import UserInit from '@/components/UserInit'
import Calculate from '@/components/Calculate'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'UserInit',
      component: UserInit
    },
    {
      path: '/calculate',
      name: 'Calculate',
      component: Calculate

    }
  ]
})
