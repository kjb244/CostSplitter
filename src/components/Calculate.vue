<template>
 <div class="container">
   <div class="row">
    <div class="col-sm-12">
     <table v-for="rec in costArr" class="table mt-5">
       <thead>
        <tr>
          <th scope="col">{{rec.name | upperCaseFirstLetterWord}} Owes</th>
        </tr>
       </thead>
       <tbody>
        <tr v-for="owe in rec.owes">
          <td> {{owe.name | upperCaseFirstLetterWord}}: ${{owe.amount}}</td>
        </tr>
      </tbody>
     </table>
    </div>
   </div>

 </div>

</template>


<script>
  import utils from'../utils/Utils';

  export default {
    name: 'calculate',
    props: {},
    data(){
      return{
        costArr: []
      }
    },
    watch: {

    },
    methods: {



    },
    created: function(){

    },
    computed:{

    },
    filters: {
      upperCaseFirstLetterWord: function(word){
        word = word || '';
        return word.substring(0,1).toUpperCase() + word.substring(1);
      }
    }        ,
    mounted: function(){
      const calculateCosts = utils.vueStore.getStore('calculateCosts');
      if(!calculateCosts) return false;
      let finalObj = {};
      let payeeModel = calculateCosts.payeeModel;
      let names = calculateCosts.arrNames.map((e) => e.name);
      finalObj = calculateCosts.arrNames.reduce((ccAccum, ccVal, i)=>{
        const currName = names[i];
        ccAccum[currName] = {};
        ccAccum[currName].payees = names.filter((name) => name !== currName)
          .reduce((accum, val) => {
            accum[val] = 0;
            return accum;
          },{});
        ccVal.costs.map((cost, j) => {
          const people = payeeModel[i][j].length + 1;
          const value = Math.round(cost.amount/people,2);
          cost.payees.map((payee) => {
           if(payeeModel[i][j].includes(payee)){
             ccAccum[currName].payees[payee] = ccAccum[currName].payees[payee] + value;
           }
          })
        });
        return ccAccum;


      },{});

      this.costArr = names.map((name, i) => {
        finalObj[name].owes = Object.assign({},finalObj[name].payees);
        Object.keys(finalObj[name].payees).map((owe) => {
          const owesMasterAmt = finalObj[name].payees[owe];
          const masterOwesAmt = finalObj[owe].payees[name] || 0;
          if(masterOwesAmt <= owesMasterAmt){
            finalObj[name].owes[owe] = 0;
          }
          else{
            finalObj[name].owes[owe] = masterOwesAmt - owesMasterAmt;
          }
        });
        const rtn =  {name: name, owes: Object.keys(finalObj[name].owes)
          .map((e) => {
            return { name: e, amount: finalObj[name].owes[e]}
          })
        };
        return rtn;
      });
      console.log(this.costArr);
    }
  }
</script>

<style scoped>


</style>
