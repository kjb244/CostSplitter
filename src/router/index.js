import Vue from 'vue'
import Router from 'vue-router'
import UserInit from '@/components/UserInit'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'UserInit',
      component: UserInit
    }
  ]
})
