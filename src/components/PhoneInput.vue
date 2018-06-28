<template>
  <input data-phone-input type="tel" v-on:input="inputChange()" :placeholder="placeholder" v-model="inputModel" >

</template>


<script>
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
        this.inputModel = val.replace(/(\d{0,3})(\d{0,3})(\d{0,4})/g,((match,p1,p2,p3) => {
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
;


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
