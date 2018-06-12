<template>
  <input data-currency-input type="text" v-on:input="valueChange()" v-on:blur="valueBlur()" :placeholder="currencyprops.placeholder" v-model="inputModel" >

</template>


<script>
  export default {
    name: 'currencyinput',
    props: ['currencyprops'],
    data(){
      return{
        inputModel: this.currencyprops.value || '',
      }
    },
    watch: {
      inputModel(val){
        this.$emit('input', val);
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
        this.$emit('valueMap', {value: this.inputModel, indexes: this.currencyprops.indexes});

      },
      valueChange: function(){
        this.inputModel =  this.currencyRules(this.inputModel);
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
  input{
    text-indent: 10px;
  }


</style>
