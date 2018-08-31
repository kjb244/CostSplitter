<template>
  <div class="master-container mb-4 mt-2">
    <md-button class="md-primary" v-bind:class="{active: activeClick.people}" :disabled="!enable.people" v-on:click="peopleClick()">People</md-button>
    <md-button class="md-primary" :disabled="!enable.expenses" v-bind:class="{active: activeClick.expenses}" v-on:click="expensesClick()">Expenses</md-button>
    <md-button class="md-primary" :disabled="!enable.pay" v-bind:class="{active: activeClick.pay}" v-on:click="payClick()">Pay</md-button>
    <md-button :disabled="!enable.people" class="md-primary" v-on:click="signOutClick()">Logout</md-button>
  </div>
</template>


<script>

  import firebase from 'firebase';
  import Vue from 'vue';


  import { MdButton } from 'vue-material/dist/components'
  import 'vue-material/dist/vue-material.min.css'
  import 'vue-material/dist/theme/default.css'
  Vue.use(MdButton);



  export default {
    name: 'menubar',
    props: ['props'],
    data(){
      return{
        activeClick: {
          people: false,
          expenses: false,
          pay: false
        },
        enable: {
          people: false,
          expenses: false,
          pay: false
        }

      }
    },
    methods: {
      clicksToFalse: function(attr){
        Object.keys(this.activeClick).map((e)=> {
          this.activeClick[e] = false;
        });
        this.activeClick[attr] = true;
      },
      peopleClick: function(){
        this.clicksToFalse('people');
        this.$router.replace({name: 'people', query: {urlKey: this.$route.query.urlKey}});
      },
      expensesClick: function(){
        this.clicksToFalse('expenses');
        this.$router.replace({name: 'users', query: {urlKey: this.$route.query.urlKey}});
      },
      payClick: function(){
        this.clicksToFalse('pay');
        this.$router.replace({name: 'calculate', query: {urlKey: this.$route.query.urlKey}});
      },
      signOutClick: function(){
        firebase.auth().signOut()
          .then(() => {
            this.$router.replace('/');
          })
          .catch((error) => {
            // An error happened
          });
      }
    },
    mounted: function(){
      const self = this;
      const href = window.location.href;
      console.log('mounted', href);
      if(href.includes('people')){
        this.activeClick.people = true;
      }

      this.$root.$on('enable', (val) => {
        Object.keys(val.enabled).map((e) => {
          self.enable[e] = val.enabled[e];
        });
        if(val.active && val.active in self.activeClick){
          self.activeClick[val.active] = true;
        }
      });
    }

  }
</script>

<style scoped>

  .master-container{
    display: flex;
    justify-content: space-around;
  }

  button.active{
    border: 1px solid #448aff;
  }

  @media (max-width: 390px){
    .master-container{
      flex-direction: column;
    }
    button{
      margin: 0;
    }
  }


</style>
