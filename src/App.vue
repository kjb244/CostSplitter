<template>
  <div id="app">
    <transition name="animate">
      <router-view/>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
  @import '../node_modules/bootstrap/scss/bootstrap.scss';

  html{
    overflow-x: hidden;
  }
  #app{
    position: relative;
  }

  #app >div{
    position: absolute;
    top: 0;
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
