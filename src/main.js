// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import 'bootstrap'
import 'bootstrap/js/dist/collapse'
import firebase from 'firebase'


Vue.config.productionTip = false;


const config = {
  apiKey: "AIzaSyBW8iQaxaRgArQiYlksvlOfC21F62wO-NU",
  authDomain: "costsplitter-747be.firebaseapp.com",
  databaseURL: "https://costsplitter-747be.firebaseio.com",
  projectId: "costsplitter-747be",
  storageBucket: "costsplitter-747be.appspot.com",
  messagingSenderId: "394155393180"
};
let app;
firebase.initializeApp(config);
firebase.auth().onAuthStateChanged((user) => {
  if(!app){
    /* eslint-disable no-new */
    new Vue({
      el: '#app',
      router,
      components: { App },
      template: '<App/>'
    });
  }
});


