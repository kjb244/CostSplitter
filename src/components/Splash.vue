<template>
  <div class="container">
    <div class="row">
      <div class="col-sm-12">
        <h4>Cost Splitter</h4>
        <button class="btn btn-primary btn-lg btn-block mt-4">Generate New</button>
        <button class="btn btn-primary btn-lg btn-block mt-4" v-on:click="existingClick = !existingClick" v-show="!existingClick">Existing</button>
        <div v-show="existingClick" class="mt-4">
          <input type="text" placeholder="enter in url" class="mb-2" v-model="modelUrl"/>
          <button class="btn btn-primary btn-lg btn-block" :disabled="!modelUrl.length" >Submit</button>
        </div>

      </div>
    </div>
  </div>
</template>


<script>

  import utils from'../utils/Utils';

  export default {
    name: 'splash',
    components: {

    },
    props: {

    },
    data(){
      return{
        existingClick: false,
        modelUrl: ''
      }
    },
    methods: {


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
  h4{
    text-align: center;
  }
  input[type="text"]{
    width: 100%;
  }

</style>
