<template>
  <div class="master-container mb-4 mt-2">
    <button type="button" class="btn btn-outline-success btn-sm" v-bind:class="{active: activeClick.people}" :disabled="!enable.people" v-on:click="peopleClick()">People</button>
    <button type="button" class="btn btn-outline-success btn-sm" :disabled="!enable.expenses" v-bind:class="{active: activeClick.expenses}" v-on:click="expensesClick()">Expenses</button>
    <button type="button" class="btn btn-outline-success btn-sm" :disabled="!enable.pay" v-bind:class="{active: activeClick.pay}" v-on:click="payClick()">Pay</button>
    <button :disabled="!enable.people"  type="button" class="btn btn-outline-success btn-sm" v-on:click="signOutClick()">Logout</button>
  </div>
</template>


<script>

  import firebase from 'firebase'


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
      if(href.includes('people')){
        this.activeClick.people = true;
      }
      this.$root.$on('enable', (val) => {
        Object.keys(val).map((e) => {
          self.enable[e] = val[e];
        })
      });
    }

  }
</script>

<style scoped>

  .master-container{
    display: flex;
    justify-content: space-evenly;
  }


</style>
