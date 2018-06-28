<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-sm-12 col-md-8 col-lg-8">

        <div v-show="showPhoneInput" class="phone-input">
          <phoneinput v-model="phone" :props="{placeholder: 'Enter phone number'}"></phoneinput>
          <input type="text" class="mt-2" placeholder="(optional) previous url" v-model="previousUrl"/>
          <button type="button"  class="btn btn-primary mt-2 btn-block"  v-on:click="fbLoginPhone()">Submit</button>
          <p class="mt-2">Note: authentication is accomplished via text message to reduce the need to remember yet another password</p>
          <div class="mt-2" id="recaptcha-container"></div>
        </div>
        <div v-show="!showPhoneInput" class="sms-input">
          <input type="password" placeholder="enter code provided via text" v-model="code"/>
          <button type="button"  class="btn btn-primary mt-2 btn-block"  v-on:click="confirmCode()">Submit Code</button>
        </div>


      </div>
    </div>
  </div>
</template>


<script>

  import firebase from 'firebase'
  import utils from'../utils/Utils'
  import phoneinput from './PhoneInput.vue';
  require('font-awesome/css/font-awesome.css');


  export default {
    name: 'loginsignup',
    components: {
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
        firebaseData: {
          recaptchaVerifier: null,
          confirmationResult: null
        }
      }
    },
    methods: {
      fbLoginPhone: function(){



        const appVerifier = this.firebaseData.recaptchaVerifier;
        firebase.auth().signInWithPhoneNumber('+1' +this.phone, appVerifier)
          .then( (confirmationResult) => {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            this.showPhoneInput = false;
            this.firebaseData.confirmationResult = confirmationResult;
          }).catch(function (error) {
            console.log(error);
            // Error; SMS not sent
          })

      },
      confirmCode: function(){
        this.firebaseData.confirmationResult.confirm(this.code).then( (result) => {
          // User signed in successfully.
          let dbKey = this.previousUrl;
          if(dbKey.length < 16){
            dbKey = utils.randomString(16);
          }


          this.$router.replace({name: 'users', query: {urlKey: dbKey} } );

        }).catch( (error) => {
          // User couldn't sign in (bad verification code?)

        });
      }


    },
    created: function(){

    },
    computed:{

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



</style>
