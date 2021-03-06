import Vue from 'vue';
import Router from 'vue-router';
import UserInit from '@/components/UserInit';
import Calculate from '@/components/Calculate';
import LoginSignup from '@/components/LoginSignup';
import People from '@/components/People';
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
      path: '/people',
      name: 'people',
      component: People,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/pay',
      name: 'pay',
      component: Calculate,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/expenses',
      name: 'expenses',
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

  if(requiresAuth && !currUser) next('/');
  else if (requiresAuth && currUser) next();
  else next();

});

export default router;
