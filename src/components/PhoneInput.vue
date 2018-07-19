<template>
  <md-field data-phone-input>
    <label>{{placeholder}}</label>
    <md-input type="tel" v-on:input="inputChange()" v-model="inputModel" ></md-input>
  </md-field>

</template>


<script>
  import Vue from 'vue'

  import { MdField } from 'vue-material/dist/components'
  import 'vue-material/dist/vue-material.min.css'
  import 'vue-material/dist/theme/default.css'
  Vue.use(MdField);

  export default {
    name: 'phoneinput',
    props: ['props'],
    data(){
      return{
        inputModel:  '',
        placeholder: (this.props||{}).placeholder || 'enter phone'
      }
    },
    watch: {
      inputModel(val){
        this.$emit('input', val);
      }
    },
    methods: {

      inputChange: function(){

        let val = this.inputModel;
        val = val.replace(/[^0-9]+/g,'').substr(0,10);
        val = val.replace(/(\d{0,3})(\d{0,3})(\d{0,4})/g,((match,p1,p2,p3) => {
          p1 = p1 || '';
          p2 = p2 || '';
          p3 = p3 || '';
          if (p3.length){
            return `${p1}-${p2}-${p3}`;
          }
          else if (p2.length){
            return `${p1}-${p2}`;
          }
          else{
            return p1;
          }
        }));

        setTimeout(() => this.inputModel = val,1);



      }


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


</style>
