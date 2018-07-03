<template>
  <div class="master-container mb-4 mt-2">
    <div v-show="show" class="inner-container" v-bind:class="{open: menuOpen}">
      <a href="javascript:void(0);" v-on:click="cogClick()">
        <i class="fa fa-cog" aria-hidden="true"></i>
      </a>
      <a href="javascript:void(0);" v-on:click="signoutClick()">Logout</a>
      <a href="javascript:void(0);" v-on:click="gobackClick()">Go Back</a>
    </div>

  </div>
</template>


<script>

  import firebase from 'firebase'
  require('font-awesome/css/font-awesome.css');


  export default {
    name: 'menubar',
    props: ['props'],
    data(){
      return{
        menuOpen: false,
        show: true,
        propsLocal: this.props || {}
      }
    },
    methods: {
      cogClick: function(){
        this.menuOpen = !this.menuOpen;
      },
      signoutClick: function(){
        firebase.auth().signOut()
          .then(() => {
            this.$router.replace('/');
          })
          .catch((error) => {
            // An error happened
          });
      },
      gobackClick: function(){
        if(this.propsLocal.goBackLogic){
          this.propsLocal.goBackLogic();
        }

      }
    },
    mounted: function(){

    }

  }
</script>

<style scoped>

  .master-container{
    position:relative;
    height: 30px;
  }
  .inner-container{
    display: flex;
    align-items: center;
    position:absolute;
    top: 0;
    right: -135px;
    transition: all .5s ease-in;
  }

  .inner-container.open{
    right: 0;
  }

  .inner-container a:nth-child(n+2){
    margin-left: 10px;
  }

  i{
    font-size: 20px;
    color: black;
  }

</style>
