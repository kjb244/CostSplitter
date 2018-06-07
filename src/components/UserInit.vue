<template>
  <div class="container">
    <div class="row">
      <div class="col-sm-12">
        <div class="input">
          <input type="text" placeholder="enter names seperated by commas" v-model="commaNames"/>
          <br>
          <button type="button"  class="btn btn-primary mt-2" :disabled="commaNames.length === 0" v-on:click="namesToArray()">Submit</button>
        </div>
      </div>
      <div class="col-sm-12 mt-4">
        <div id="accordion" v-show="arrNames.length>0">
          <div class="card" v-for="(rec,index) in arrNames">
            <div class="card-header" :id="'heading' + index">
              <h5 class="mb-0">
                <button class="btn btn-link" data-toggle="collapse" :data-target="'#' + rec.id" v-on:click="populatePayeeModelArr(index)">{{rec.name}}</button>
              </h5>
            </div>
            <div :id="rec.id" class="collapse" data-parent="#accordion">
              <div class="card-body">
                <div class="row mb-3" v-for="(cost, index2) in rec.costs">
                  <div class="col-sm-12">
                    <input type="text" placeholder="for what" :disabled="cost.disabled" v-model="cost.what"/>
                  </div>
                  <div class="col-sm-12 mt-2">
                    <currencyinput :currencyprops="currencyProps" :disabled="cost.disabled" v-model="cost.amount"></currencyinput>

                  </div>
                  <div class="col-sm-12 mt-2">
                    <div class="checkbox-wrapper" v-for="(payee, index3) in cost.payees">
                      <input type="checkbox" :id="'checkbox' + payee + index + index2" :value="payee" v-model="payeeModel[index][index2]">
                      <label :for="'checkbox' + payee + index + index2">{{payee}}</label>

                    </div>

                  </div>
                </div>
                <div class="row buttons-row">
                  <div class="col-sm-12  buttons-column">
                    <button class="btn btn-info" :disabled="addAnotherCostRow(index)" v-on:click="addCost(index)">Add</button>
                    <button class="btn btn-info" :disabled="rec.costs.length === 0" v-on:click="removeCost(index)">Remove</button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
    <div class="row input mt-4" v-show="arrNames.length">
      <div class="col-sm-12">
        <button class="btn btn-primary" v-on:click="calculateCosts()">Calculate Costs</button>
      </div>
    </div>
  </div>
</template>


<script>
  import currencyinput from './CurrencyInput.vue';
  import utils from '../utils/Utils';
  import firebase from 'firebase'

  export default {
    name: 'userinit',
    components: {
      currencyinput
    },
    props: {

    },
    data(){
      return{
        commaNames: '',
        arrNames: [],
        payeeModel: [[[]]],
        currencyProps: {
          placeholder: 'Enter amount',
          value: ''
        }
      }
    },
    methods: {
      dbAddNames: function(commaNamesArr){
        const db = firebase.database();
        const urlKey = this.$route.query.urlKey;
        db.ref().child('/master/urlKeyMap/' + urlKey).set({users: commaNamesArr.map(e => e.trim())});
        const map = commaNamesArr.reduce((accum,val) => {
          accum[val.trim()] = {costs: false};
          return accum;
        },{});
        db.ref().child('/master/costMap/' + urlKey).set(map);
      },
      namesToArray: function(){
        const commaNamesArr = this.commaNames.split(',');
        this.dbAddNames(commaNamesArr);
        this.arrNames = commaNamesArr.map((e,i) =>{
          this.payeeModel.push([]);
          return {
            name: e.trim(),
            id: e.trim().replace(/\s+/g,'') + i,
            costs: [this.addBaseCostObject(e.trim())]
          }
        });

      },
      addCost: function(index){
        let length = this.arrNames[index].costs.length;
        let costsArr = this.arrNames[index].costs;
        costsArr.push(this.addBaseCostObject(this.arrNames[index].name));
        this.enableDisableByIndex(costsArr, --length, false);
        this.populatePayeeModelArr(index);
      },
      removeCost: function(index){
        this.arrNames[index].costs.splice(-1);
        let length = this.arrNames[index].costs.length;
        this.enableDisableByIndex(this.arrNames[index].costs, --length, true);
        this.removePayeeModalArr(index);
      },
      addBaseCostObject: function(name){
        const payees = this.commaNames.split(',')
          .map(e => e.trim())
          .filter(e => e !== name);
        return {
          what: '',
          amount: '',
          disabled: false,
          payees: payees
        }
      },
      addAnotherCostRow: function(index){
        const mapper = this.arrNames[index].costs;
        const arr = [];
        mapper.map((e)=> {
          arr.push(e.what.length > 0 && e.amount.length > 0);
        });

        return this.arrNames.length && arr.includes(false);

      },
      populatePayeeModelArr: function(index){
        const costsArr = this.arrNames[index].costs;
        if(!this.payeeModel[index]){
          this.payeeModel.push([]);
        }
        if(!this.payeeModel[index][costsArr.length-1]){
          this.payeeModel[index].push([]);
        }
        if(!Array.isArray(this.payeeModel[index][costsArr.length-1])) {
          this.payeeModel[index][costsArr.length - 1] = [];
        }
      },

      removePayeeModalArr: function(index){
        const costsArr = this.arrNames[index].costs;
      },

      enableDisableByIndex: function(costs, index, enabled){
        if(index > -1){
          costs[index].disabled = !enabled;
        }
      },
      calculateCosts: function(){
        utils.vueStore.setStore('calculateCosts', {'arrNames': this.arrNames, 'payeeModel':  this.payeeModel});
        window.location.hash = '#/calculate';
      }

    },
    created: function(){
      let db = firebase.database();
      const urlKey = this.$route.query.urlKey;
      const initalObj = {urlKeys: {[urlKey]:''},
                        urlKeyMap: {[urlKey]:
                                      { users: false}},
                        costMap: {[urlKey]: false}};

      db.ref('master').once('value', snapshot => {
        //if we don't have master node then create
        if(!snapshot.val()){
          db.ref('master/').update(initalObj);
        }
        //if we don't have key then add it
        else{
          db.ref('master').child('urlKeys').once('value', snapshot2 => {
            const urlKeys = (snapshot2.val() || {});
            if(urlKeys && !(urlKey in urlKeys)){
              db.ref().child('/master/urlKeys/' + urlKey).set(false);
              db.ref().child('/master/urlKeyMap/' + urlKey).set({users: false});
              db.ref().child('/master/costMap/' + urlKey).set(false);
            }
            //if we're here then we have data for this urlKey so populate model
            else {
              const node = snapshot.val();
              this.commaNames = node.urlKeyMap[urlKey].users.join(',');


            }

          })
        }
      })


    },
    computed:{

    },
    mounted: function(){

    }
  }
</script>

<style scoped>
  .input input[type="text"], .input button{
    width: 100%;
  }

  .card-body input[type="text"]{
    width: 100%;
  }

  .buttons-row > .buttons-column{
    display: flex;
  }

  .card-body .buttons-row .buttons-column button{
    flex: 48%;
  }

  .card-body .buttons-row .buttons-column button:first-child{
    margin-right: 2%;
  }

  input{
    text-indent: 10px;
  }



</style>
