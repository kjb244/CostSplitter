<template>
  <div class="master-container mb-4 mt-2">
    <md-button v-for="(value, name, index) in routeStatus"
               :disabled="value.enabled === false"
               v-bind:class="{active: value.active === true}"
               v-bind:key="index"
               v-on:click="tabClick(name)"
               class="md-primary"
               >{{value.name}}</md-button>
  </div>
</template>


<script>

  import Vue from 'vue';
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import { MdButton } from 'vue-material/dist/components'
  import 'vue-material/dist/vue-material.min.css'
  import 'vue-material/dist/theme/default.css'
  Vue.use(MdButton);



  export default {
    name: 'menubar',
    props: ['props'],
    data(){
      return{


      }
    },
    methods: {
      ...mapActions([
        'changeRoute', 'logOut'
      ]),
      tabClick: function(name){
        if(name.toUpperCase().includes('LOGOUT')){
          this.logOut();
        }
        else{
          this.changeRoute({route: name, query: {urlKey: this.$route.query.urlKey} } );

        }
      },

    },
    computed: {

      ...mapGetters([
        'routeStatus'
      ]),
    },
    mounted: function(){

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
