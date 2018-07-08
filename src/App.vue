<template>
  <div id="app">
    <menubar></menubar>
    <transition name="animate">
      <router-view/>
    </transition>
  </div>
</template>



<script>
  import menubar from './components/MenuBar.vue';


  export default {
  name: 'App',
  components: {
    menubar
  },
}
</script>


<style lang="scss">
  @import '../node_modules/bootstrap/scss/bootstrap.scss';

  #app{
    position: relative;
  }

  #app >div + div{
    position: absolute;
    left: 0;
  }

  .animate-enter-active{
    order: 2;
    animation: left-animation-in 1s linear;

  }

  .animate-leave-active{
    order: 1;
    animation: left-animation-out .5s linear;
  }

  @keyframes left-animation-out {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes left-animation-in {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }
</style>
