<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-sm-12 col-md-8 col-lg-8">
        <h3 class="mb-3 mt-3 text-center">Cost Splitter</h3>

        <div v-show="showPhoneInput" class="phone-input">
          <phoneinput v-model="phone" :props="{placeholder: 'Enter phone number'}"></phoneinput>
          <md-field>
            <label>(optional) previous url</label>
            <md-input type="text" v-model="previousUrl"></md-input>
          </md-field>
          <md-button :disabled="loading.show || phone.length !== 12"  class="md-raised md-primary"  v-on:click="fbLoginPhone()">Submit</md-button>
          <div class="loading-modal mt-3">
            <modaloverlay :modalprops="loading"></modaloverlay>
          </div>

          <p class="mt-2">Note: authentication is accomplished via text message to reduce the need to remember yet another password</p>
          <div class="mt-2" id="recaptcha-container"></div>
        </div>

        <div v-show="!showPhoneInput" class="sms-input">
          <md-field>
            <label>enter code provided via text</label>
            <md-input type="password" v-model="code"></md-input>
          </md-field>
          <md-button class="md-raised md-primary" v-on:click="confirmCode()">Submit Code</md-button>
        </div>

        <div v-show="otherSessions.length" class="other-sessions mt-5">
          <p>We found the following other sessions - please pick an appropriate one</p>
          <div v-for="(rec, idx) in otherSessions">
            <md-button class="md-raised md-primary mb-1" v-on:click="pickSession(rec.id)">Session {{idx+1}}</md-button>
            <div v-for="rec2 in rec.people">
              <p>{{rec2}}</p>
            </div>
          </div>
          <md-button class="md-raised md-primary mb-2" v-on:click="pickSession('')">New Blank Session</md-button>

        </div>



      </div>
    </div>
  </div>
</template>


<script>

  import Vue from 'vue'
  import firebase from 'firebase'
  import utils from'../utils/Utils'
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import phoneinput from './PhoneInput.vue';
  import modaloverlay from './ModalOverlay.vue';
  require('font-awesome/css/font-awesome.css');

  import { MdField, MdCheckbox, MdButton } from 'vue-material/dist/components'
  import 'vue-material/dist/vue-material.min.css'
  import 'vue-material/dist/theme/default.css'
  Vue.use(MdField);
  Vue.use(MdCheckbox);
  Vue.use(MdButton);



  export default {
    name: 'loginsignup',
    components: {
      modaloverlay,
      phoneinput

    },
    props: {

    },
    data(){
      return{
        phone: '',
        code: '',
        previousUrl: '',
        test: '',
        showPhoneInput: true,
        otherSessions: [],
        loading: {
          show: false,
          type: 'loadingdiv'
        },
        firebaseData: {
          recaptchaVerifier: null,
          confirmationResult: null
        }
      }
    },
    methods: {
      ...mapActions([
        'changeRoute'
      ]),

      fbLoginPhone: function(){

        const appVerifier = this.firebaseData.recaptchaVerifier;
        this.loading.show = true;
        firebase.auth().signInWithPhoneNumber('+1' +this.phone, appVerifier)
          .then( (confirmationResult) => {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            this.showPhoneInput = false;
            this.loading.show = false;
            this.firebaseData.confirmationResult = confirmationResult;
          }).catch(function (error) {
            console.log(error.message);
            // Error; SMS not sent
          })

      },
      writeUserToDb: function(dbKey){
        return new Promise((resolve, reject) => {
          const db = firebase.database();
          const self = this;
          const fbUser = firebase.auth().currentUser;

          const prom = addUsers();
          prom.then(() => {
            resolve();
          });

          function addUsers() {
            return new Promise((resolve, reject) => {
              function addUsersInner() {
                const urlKey = self.$route.query.urlKey;
                db.ref('master/userMap').once('value', snapshot => {
                  if (fbUser) {
                    //no users in node so add curr one
                    if (snapshot.val() === false) {
                      db.ref('master/userMap').set({[fbUser.uid]: [dbKey]}).then(() => {
                        resolve();

                      });

                    }
                    //either user isn't in node
                    else {
                      const node = (snapshot.val()[fbUser.uid]) || [];
                      //if url key isn't in there then add it
                      if (Array.isArray(node) && !node.includes(dbKey)) {
                        db.ref('master/userMap').update({[fbUser.uid]: [...node, dbKey]}).then(() => {
                          resolve();
                        });
                      }
                      else {
                        resolve();
                      }
                    }
                  }
                });
              }

              db.ref('master').child('userMap').once('value', snapshot => {
                //don't have userMap node then create it
                if (snapshot.val() === null) {
                  db.ref('master/').update({userMap: false}).then((e) => {
                    addUsersInner();
                  })
                }
                //have userMap node so put user in it
                else {
                  addUsersInner();
                }
              });
            });
          }
        })


      },
      pickSession: function(id){
          id = id.length ? id : utils.randomString(16);
          const prom =  this.writeUserToDb(id);
          prom.then(() => {
            this.changeRoute({route: 'people', query: {urlKey: id} } );
          });

      },
      confirmCode: function(){
        const db = firebase.database();
        const self = this;
        const fbUser = firebase.auth().currentUser;

        this.firebaseData.confirmationResult.confirm(this.code).then( (result) => {
          // User signed in successfully.
          let dbKey = this.previousUrl;
          //they didn't put in key so check if they have other sessions
          if(dbKey.length < 16){
            db.ref(`master/userMap/${fbUser.uid}`).once('value', snapshot => {
              const node = snapshot.val();
              //if they have other sessions
              if(Array.isArray(node)){
                let promiseArr = [];
                node.map((e) => {
                  promiseArr.push(validOtherSessions(e));
                });
                Promise.all(promiseArr).then(() => {
                  //if they don't have any other sessions that have data in then take to next screen
                  //for some reason we need a timeout here
                  //possibly the array isn't getting updated until later then we think
                  setTimeout(()=> {
                    if(!self.otherSessions.length){
                      const dbKey = utils.randomString(16);
                      const prom = self.writeUserToDb(dbKey);
                      prom.then(() =>{
                        this.changeRoute({route: 'people', query: {urlKey: dbKey} } );

                      })
                    }
                  },250);

                });


                function validOtherSessions(e){
                  return new Promise((resolve, reject) => {
                    db.ref(`master/costMap/${e}`).once('value', snapshot2 => {
                      if(snapshot2.val()){
                        const obj = snapshot2.val();
                        if(typeof obj === 'object'){
                          self.otherSessions.push({id: e, people: Object.keys(obj)});
                          resolve();
                        }
                        resolve();
                      }
                      else{
                        resolve();
                      }
                    });
                  });
                }

              }
              //no other sessions and they didn't put in a urlKey so write their name to db and pick a random session
              else{
                const dbKey = utils.randomString(16);
                const prom = self.writeUserToDb(dbKey);
                prom.then(() =>{
                  this.changeRoute({route: 'people', query: {urlKey: dbKey} } );

                })
              }


            });
          }
          //they put in key so just move them to next route with key
          else{
            this.changeRoute({route: 'people', query: {urlKey: dbKey} } );
          }



        }).catch( (error) => {
          // User couldn't sign in (bad verification code?)

        });
      }


    },
    created: function(){

    },
    computed:{
      ...mapGetters([
        'routeStatus'
      ]),

    },
    mounted: function(){


      this.firebaseData.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'normal',
        'callback': function(response) {

        },
        'expired-callback': function() {

        }
      });
    }
  }
</script>

<style scoped>
  input{
    width: 100%;
    text-indent: 10px;
  }

  button{
    width: 100%;
    margin: 0;
  }

  .loading-modal{
    text-align: center;
    font-size: 22px;
  }



</style>
