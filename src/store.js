import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import router from './router';
import firebase from 'firebase';



Vue.use(Vuex);


export default new Vuex.Store({
  state: {
      routeData: {
        routes: ['people','expenses','pay','logout'],
        routeStatus: ['people','expenses','pay','logout'].reduce((accum, e) => {
          const name = e.substr(0,1).toUpperCase() + e.substr(1);
          accum[e] = {active: false, enabled: false, name };
          return accum;
        },{})
      }
  },
  getters: {
    routeStatus: (state) =>  {
        return state.routeData.routeStatus || [];
    }


  },
  mutations: {
    MAKE_ROUTES_ENABLED: function(state, routesArr){
      Object.keys(state.routeData.routeStatus).map((e) =>{
        if(routesArr.includes(e)){
          state.routeData.routeStatus[e] = {...state.routeData.routeStatus[e], enabled: true};
        }
        else{
          state.routeData.routeStatus[e] = {...state.routeData.routeStatus[e], active: false, enabled: false};
        }
      });

    },
    CHANGE_ROUTE: function(state, data){
      const {route, query } = data;
      Object.keys(state.routeData.routeStatus).map((e) =>{

        if(e === route){
          state.routeData.routeStatus[route] = {...state.routeData.routeStatus[e], active: true, enabled: true};
        }
        else {
          state.routeData.routeStatus[e] = {...state.routeData.routeStatus[e], active: false};
        }
      });

      router.replace({name: route, query});

    },


  },
  actions: {
    changeRoute: function(context, data){

        const routes = this.state.routeData.routes;
        if(routes.includes(data.route)){

          context.commit('CHANGE_ROUTE', data);
        }


    },
    makeRoutesEnabled: function(context, routesArr){
      const routes = this.state.routeData.routes;
      if(Array.isArray(routesArr) && routesArr.every(e => routes.includes(e))){
        context.commit('MAKE_ROUTES_ENABLED', routesArr)
      }

    },
    logOut: function(context){
      firebase.auth().signOut()
        .then(() => {
          router.replace('/');
          context.commit('MAKE_ROUTES_ENABLED',[]);
        })
        .catch((error) => {
          // An error happened
        });
    },
    testAjaxGet: function(){
        return axios.get('http://jsonplaceholder.typicode.com/posts');

    }
  }

})
