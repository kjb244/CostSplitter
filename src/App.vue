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

  #app{
    display: flex;
  }

  #app >div{
    flex: 100%;
  }

  .animate-enter-active{
    order: 2;
    animation: left-animation-in 1s linear;
  }

  .animate-leave-active{
    order: 1;
    animation: left-animation-out 1s linear;
  }

  @keyframes left-animation-out {
    0%   { margin-left: 0; }
    100% { margin-left: -100% }
  }

  @keyframes left-animation-in {
    0%   { margin-right: -100%; }
    100% { margin-right: 0; }
  }
</style>
