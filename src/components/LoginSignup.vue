<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-sm-12 col-md-8 col-lg-8">
        <nav>
          <div class="nav nav-tabs" id="nav-tab" role="tablist">
            <a class="nav-item nav-link active" id="nav-login-tab" data-toggle="tab" href="#nav-login" role="tab" aria-controls="nav-login" aria-selected="true">Login</a>
            <a class="nav-item nav-link" id="nav-signup-tab" data-toggle="tab" href="#nav-signup" role="tab" aria-controls="nav-signup" aria-selected="false">Signup</a>

          </div>
        </nav>
        <div class="tab-content" id="nav-tabContent">
          <div class="tab-pane fade show active mt-2" id="nav-login" role="tabpanel" aria-labelledby="nav-login-tab">
            <input type="text" class="mt-2" placeholder="email" v-model="login.username"/>
            <input type="password" class="mt-2" placeholder="password" v-model="login.password"/>
            <input type="text" class="mt-2" placeholder="(optional) - enter unique key" v-model="login.url"/>
            <button class="btn btn-primary btn-block mt-2" v-on:click="loginSubmit()" :disabled="!(login.username.length  && login.password.length) ">Login</button>
            <p class="mt-2">{{login.message}}</p>
          </div>
          <div class="tab-pane fade" id="nav-signup" role="tabpanel" aria-labelledby="nav-signup-tab">
            <div class="tab-pane fade show active mt-2" id="nav-signup" role="tabpanel" aria-labelledby="nav-signup-tab">
              <input type="text" class="mt-2" placeholder="email" v-model="signup.username"/>
              <input type="password" class="mt-2" placeholder="password" v-model="signup.password"/>
              <button class="btn btn-primary btn-block mt-2" v-on:click="signupSubmit()" :disabled="!(signup.username.length  && signup.password.length) ">Signup</button>
              <p class="mt-2">{{signup.message}}</p>
            </div>


          </div>
        </div>

      </div>
    </div>
  </div>
</template>


<script>

  import firebase from 'firebase'
  import utils from'../utils/Utils'

  export default {
    name: 'loginsignup',
    components: {

    },
    props: {

    },
    data(){
      return{
        login: {
          username: '',
          password: '',
          url: '',
          message: ''
        },
        signup: {
          username: '',
          password: '',
          message: ''
        }
      }
    },
    methods: {
      loginSubmit: function(){
        this.login.message = '';
        firebase.auth().signInWithEmailAndPassword(this.login.username, this.login.password).then((user) => {
          let dbKey = this.login.url;
          if(!dbKey.length){
            dbKey = utils.randomString(16);
          }

          this.$router.replace({name: 'users', query: {urlKey: dbKey} } );
        }).catch((error) => {
          this.login.message = error.message;
        })

      },
      signupSubmit: function(){
        this.signup.message = '';
        firebase.auth().createUserWithEmailAndPassword(this.signup.username, this.signup.password).then((user) => {
          if(user){
            this.signup.message = 'account created - please login';
          }

        }).catch((error) =>{
          this.signup.message = error.message;
        })
      }

    },
    created: function(){

    },
    computed:{

    },
    mounted: function(){

    }
  }
</script>

<style scoped>
  input{
    width: 100%;
    text-indent: 10px;
  }



</style>
