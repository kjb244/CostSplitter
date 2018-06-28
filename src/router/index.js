import Vue from 'vue'
import Router from 'vue-router'
import UserInit from '@/components/UserInit'
import Calculate from '@/components/Calculate'
import LoginSignup from '@/components/LoginSignup'
import firebase from 'firebase'

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '*',
      redirect: '/login'
    },
    {
      path: '/',
      name: 'loginsignup',
      component: LoginSignup
    },
    {
      path: '/calculate',
      name: 'calculate',
      component: Calculate,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/users',
      name: 'users',
      component: UserInit,
      meta: {
        requiresAuth: true
      }
    },
  ]
});

router.beforeEach((to, from, next) => {
  const currUser = firebase.auth().currentUser;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if(requiresAuth && !currUser) next('login');
  else if (requiresAuth && currUser) next();
  else next();

});

export default router;
