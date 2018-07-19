<template>
  <md-field>
    <label>{{currencyprops.placeholder}}</label>
    <md-input :disabled="disabled" data-currency-input type="text" v-on:input="valueChange()" v-on:blur="valueBlur()" v-model="inputModel" ></md-input>
  </md-field>

</template>


<script>
  import Vue from 'vue'

  import { MdField } from 'vue-material/dist/components'
  import 'vue-material/dist/vue-material.min.css'
  import 'vue-material/dist/theme/default.css'
  Vue.use(MdField);

  export default {
    name: 'currencyinput',
    props: ['currencyprops'],
    data(){
      return{
        inputModel: this.currencyprops.value || '',
        disabled: this.currencyprops.disabled || false,
      }
    },
    watch: {
      'currencyprops.value': function(newVal, oldVal){
        this.inputModel = newVal;
      },
      'currencyprops.disabled': function(newVal, oldVal){
        this.disabled = newVal;
      }
    },
    methods: {

      valueBlur: function(){
        const value = this.inputModel;
        if(value.includes('.')){
          let parts = value.split('.');
          parts[1] = this.padZeros(parts[1]);
          this.inputModel = `${parts[0]}.${parts[1]}`;
        }

      },
      valueChange: function(){
        const inp =  this.currencyRules(this.inputModel);
        setTimeout(() => {
          this.inputModel = inp;
        },1);
        setTimeout(() => {
          this.$emit('valueMap', {value: this.inputModel, indexes: this.currencyprops.indexes} );
          },50);

      },
      currencyRules: function(value){
        let valu = value || '';
        let goodValue = valu.replace(/[^0-9\.]/g,'');
        //strip more than one period
        const periods = goodValue.length - goodValue.replace(/\./g,'').length;
        if(periods > 1){
          for(let i=0; i<periods-1;i++){
            goodValue = goodValue.replace(/\./,'');
          }
        }

        const parts = goodValue.split('.');
        let firstPart = '';
        let secondPart = '';
        //add commas
        firstPart = parts[0].split('').reverse().map((e,i) => {
            if(i>0 && i%3 === 0){
              return  e + ',';
            }
            return e;
          }).reverse().join('');
        secondPart = parts.length > 1 ? `.${parts[1]}` : '';

        return `${firstPart}${secondPart}`;

      },
      padZeros: function(inp){
        inp = inp || '';
        if(inp.length === 0){
          return '00';
        }
        else if (inp.length === 1){
          return inp + '0';
        }

        return inp.substr(0,2);
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
