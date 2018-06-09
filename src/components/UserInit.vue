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
                    <input type="text" placeholder="for what" :disabled="cost.disabled" v-model="cost.what" v-on:change="dbOnChange('what',index,index2,cost)"/>
                  </div>
                  <div class="col-sm-12 mt-2">
                    <currencyinput :currencyprops="{placeholder: currencyProps.placeholder, value: cost.amount}" :disabled="cost.disabled"  v-model="cost.amount" v-on:input="test"></currencyinput>

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
  import firebase from 'firebase';


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
        }
      }
    },
    watch: {




    },
    methods: {
      test: function(val){
        console.log(val);
      },
      dbOnChange: function(type, index, index2, cost){
        const db = firebase.database();
        const urlKey = this.$route.query.urlKey;
        const name = this.arrNames[index].name;
        const obj = type === 'what' ? {what: cost.what} : {amount: cost.amount};
        db.ref().child(`/master/costMap/${urlKey}/${name}/costs/${index2}`).update(obj);
      },
      dbRemoveAllListeners: function(){
        const db = firebase.database();
        const urlKey = this.$route.query.urlKey;
        this.arrNames.map((e)=> {
          db.ref(`master/costMap/${urlKey}/${e.name}/costs`).off();
        });

      },
      dbWriteAll: function(){
        const db = firebase.database();
        const urlKey = this.$route.query.urlKey;
        db.ref().child('/master/urlKeyMap/' + urlKey).set({users: this.arrNames.map( e => e.name)});
        const map = this.arrNames.reduce((accum,val, idx) => {
          accum[val.name] = {costs: val.costs.map( (e, idx2) => {
            delete e.disabled;
            e.payeeArr = this.payeeModel[idx][idx2];
            return e;
          })};
          return accum;

        },{});

        db.ref().child('/master/costMap/' + urlKey).set(map);
      },
      namesToArray: function(){
        const commaNamesArr = this.commaNames.split(',');
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
        //utils.vueStore.setStore('calculateCosts', {'arrNames': this.arrNames, 'payeeModel':  this.payeeModel});
        //window.location.hash = '#/calculate';
        this.dbRemoveAllListeners();
        this.dbWriteAll();
      }


    },
    created: function(){
      let db = firebase.database();
      const urlKey = this.$route.query.urlKey;
      const self = this;
      const createdDt = new Date();

      init();



      function addListeners(){
        const arr = self.arrNames;

        arr.map((e) => {
          db.ref(`master/costMap/${urlKey}/${e.name}/costs`).off();
          db.ref(`master/costMap/${urlKey}/${e.name}/costs`).on('child_added', (snapshot) => {
            const listenerDate = new Date();
            if(listenerDate.getTime()/1000 - createdDt.getTime()/1000 <2){
              return false;
            }

            const val = snapshot.val();
            arr.find(data => data.name === e.name).costs.push(val);
          });
          db.ref(`master/costMap/${urlKey}/${e.name}/costs`).on('child_removed', (snapshot) => {
            console.log('changed removed', e.name, snapshot.val());
          });
        });

      }

      function init() {
        const initialObj = {
          urlKeys: {[urlKey]: ''},
          urlKeyMap: {
            [urlKey]:
              {users: false}
          },
          costMap: {[urlKey]: false}
        };

        db.ref('master').once('value', snapshot => {
          //if we don't have master node then create
          if (!snapshot.val()) {
            db.ref('master/').update(initialObj);
          }
          //if we don't have key then add it
          else {
            db.ref('master').child('urlKeys').once('value', snapshot2 => {
              const urlKeys = (snapshot2.val() || {});
              if (urlKeys && !(urlKey in urlKeys)) {
                db.ref().child('/master/urlKeys/' + urlKey).set(false);
                db.ref().child('/master/urlKeyMap/' + urlKey).set({users: false});
                db.ref().child('/master/costMap/' + urlKey).set(false);
              }
              //if we're here then we have data for this urlKey so populate model
              else {
                const node = snapshot.val();
                self.commaNames = node.urlKeyMap[urlKey].users.join(',');
                const costMapUsers = node.costMap[urlKey];
                Object.keys(costMapUsers).map((e, i) => {
                  self.payeeModel.push([]);
                  const entry = costMapUsers[e];
                  const costArr = entry.costs.map((e, i2) => {
                    self.payeeModel[i][i2] = e.payeeArr;
                    return Object.assign({}, e, {disabled: false});
                  });
                  const obj = {name: e, id: e.trim().replace(/\s+/g, '') + i, costs: costArr};
                  self.arrNames.push(obj);
                });
                addListeners();
              }
            })
          }
        });
      }






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
