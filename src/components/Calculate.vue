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
          <td> {{owe.name | upperCaseFirstLetterWord}}: ${{owe.amount | formatCurrency}}</td>
        </tr>
      </tbody>
      </table>
    </div>
   </div>

 </div>

</template>


<script>
  import firebase from 'firebase';

  export default {
    name: 'calculate',
    components: {
    },
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
      let db = firebase.database();
      const urlKey = this.$route.query.urlKey;
      const self = this;

      function constructModel(inputData){
        let finalObj = {};
        let names = Object.keys(inputData);
        finalObj = names.reduce((ccAccum, ccVal, i)=>{
          const currName = ccVal;
          let currNode = inputData[currName];
          ccAccum[currName] = {};
          ccAccum[currName].payees = names.filter(e => e !== currName)
            .reduce((accum, val) => {
              accum[val] = 0;
              return accum;
            },{});
          if(currNode === false){
            currNode = {costs:[]};

          }
          currNode.costs.map((cost, j) => {
            const payees = Object.keys(cost.payees || {});
            const people = payees.length + 1;
            const value = Math.round((cost.amount + '').replace(/,/g,'')/people,2);
            payees.map((payee) => {
              ccAccum[currName].payees[payee] = ccAccum[currName].payees[payee] + value;
            })
          });
          return ccAccum;


        },{});

        self.costArr = names.map((name, i) => {
          finalObj[name].owes = Object.assign({},finalObj[name].payees);
          Object.keys(finalObj[name].payees).map((owe) => {
            const owesMasterAmt = finalObj[name].payees[owe];
            const masterOwesAmt = finalObj[owe].payees[name] || '0';
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

      }

      db.ref(`master/costMap/${urlKey}`).once('value', (snapshot) => {
        const data = snapshot.val();
        constructModel(data);
      });

    },
    computed:{

    },
    filters: {
      upperCaseFirstLetterWord: function(word){
        word = word || '';
        return word.substring(0,1).toUpperCase() + word.substring(1);
      },
      formatCurrency: function(curr){

        curr = (curr + '').replace(/,/g,'');
        const parts = curr.split('.');
        const partsDecimal = parts.length > 1 ? '.' + parts[1] : '';
        return parts[0].split('').reverse().map((e,i) => {
          if(i>0 && i%3 === 0){
            return e + ',';
          }
          return e;
        }).reverse().join('') + partsDecimal;
      }
    }        ,
    mounted: function(){
      this.$root.$emit('enable',
        {active: 'pay',
          enabled: {
            people: true,
            expenses: true,
            pay: true
          }
        }
      );

    }
  }
</script>

<style scoped>


</style>
