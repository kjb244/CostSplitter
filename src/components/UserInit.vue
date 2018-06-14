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
                    <currencyinput :currencyprops="{placeholder: currencyProps.placeholder, value: cost.amount, indexes: [index,index2]}" :disabled="cost.disabled"  v-model="cost.amount" v-on:valueMap="currencyNodeChange"></currencyinput>

                  </div>
                  <div class="col-sm-12 mt-2">
                    <div class="checkbox-wrapper" v-for="(payee, index3) in cost.payees">
                      <input type="checkbox" :id="'checkbox' + payee + index + index2" :value="payee" v-on:change="dbOnChangeCB(index, index2, payee)" v-model="payeeModel[index][index2]">
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
      dbRemoveCostNode: function(index){
        const db = firebase.database();
        const urlKey = this.$route.query.urlKey;
        const name = this.arrNames[index].name;
        const idxToRemove = this.arrNames[index].costs.length;
        if(idxToRemove>0){
          db.ref().child(`/master/costMap/${urlKey}/${name}/costs`).child(idxToRemove).remove();

        }
        else{
          db.ref().child(`/master/costMap/${urlKey}/${name}/costs`).child(idxToRemove).set(false);

        }

      },
      dbOnChangeCB: function(index, index2, payee){
        const db = firebase.database();
        const urlKey = this.$route.query.urlKey;
        const name = this.arrNames[index].name;
        const checked = this.payeeModel[index][index2].includes(payee) ? true: false;
        const qs = `/master/costMap/${urlKey}/${name}/costs/${index2}`;

        db.ref().child(qs).once('value', (snapshot) => {
          const payees = snapshot.child('payees');
          if(!payees.val() && checked){
            snapshot.ref.update({payees: {[payee]: false}});
          }
          else if (payees.val() && checked){
            snapshot.ref.child('payees').update({[payee]: false})
          }
          else if (payees.val() && !checked){
            const name = payees.child(payee);
            if(name !== undefined){
              snapshot.ref.child('payees').child(payee).remove();
            }
          }

        });
      },

      dbAddUrlKeys: function(){
        const db = firebase.database();
        const urlKey = this.$route.query.urlKey;
        db.ref().child('/master/urlKeyMap/' + urlKey).set({users: this.arrNames.map( e => e.name)});
        const obj =  this.arrNames.reduce((accum,e) => {
          accum[e.name]=false;
          return accum;},{}
          );
        db.ref().child(`/master/costMap/${urlKey}`).set(obj);
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
      currencyNodeChange: function(obj){
        const indexes = obj.indexes;
        const value = obj.value;
        this.dbOnChange('amount',indexes[0], indexes[1], {amount: value});
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
        this.dbAddUrlKeys();

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
        this.removePayeeModelArr(index);
        this.dbRemoveCostNode(index);
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
          arr.push((e.what || '').length > 0 && (e.amount || '').length > 0);
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

      removePayeeModelArr: function(index){
        const costsArr = this.arrNames[index].costs;
        this.payeeModel[index][costsArr.length] = [];
      },

      enableDisableByIndex: function(costs, index, enabled){
        if(index > -1){
          costs[index].disabled = !enabled;
        }
      },
      calculateCosts: function(){

        this.dbRemoveAllListeners();

      }


    },
    created: function(){
      let db = firebase.database();
      const urlKey = this.$route.query.urlKey;
      const self = this;
      let createdDt = null;

      init();



      function addListeners(){
        const arr = self.arrNames;

        arr.map((e) => {
          db.ref(`master/costMap/${urlKey}/${e.name}`).off();
          db.ref(`master/costMap/${urlKey}/${e.name}`).on('value', (snapshot) => {
            const listenerDate = new Date();
            if(listenerDate.getTime()/1000 - createdDt.getTime()/1000 <2){
              return false;
            }

            const val = snapshot.val();
            compareUpdates(val, e.name);
            //arr.find(data => data.name === e.name).costs.push(val);
          });
          db.ref(`master/costMap/${urlKey}/${e.name}/costs`).on('child_removed', (snapshot) => {
            console.log('changed removed', e.name, snapshot.val());
          });
        });

      }

      function compareUpdates(val, name){
        const firstPos = self.arrNames.map((e,i) => {if (e.name === name) return i;})[0];
        const currObj = self.arrNames.find(e => e.name === name);
        let payees = self.arrNames.map(e => e.name).filter((e) => e !== name);
        //someone added an element to costs
        if(val.costs.length > currObj.costs.length){
          self.payeeModel[firstPos].push([]);
          self.payeeModel[firstPos][currObj.length] = Object.keys(val.costs.payees || []);
          const newNode = val.costs.pop();

          const finalNode = Object.assign({},
            {amount: '', what: '', disabled: false, payees: payees},
            newNode);
          self.arrNames[firstPos].costs.push(finalNode);
        }
        //someone removed an element from costs
        else if (val.costs.length < currObj.costs.length){
          self.payeeModel[firstPos].pop();
          self.arrNames[firstPos].costs.splice(-1);
        }
        //someone changed a property in the cost array
        else if(Array.isArray(val.costs)){
          val.costs.map((cost,i) => {
            const amountDb = cost.amount || '';
            const payeesDb = Object.keys(cost.payees || {});
            const whatDb = cost.what || '';

            const amountCurr = currObj.costs[i].amount || '';
            let payeesCurr = self.payeeModel[firstPos][i];
            const whatCurr = currObj.costs[i].what || '';

            if(amountDb !== amountCurr){
              currObj.costs[i].amount = amountDb;
            }
            if(whatDb !== whatCurr){
              currObj.costs[i].what = whatDb;
            }
            if (JSON.stringify(payeesDb.sort()) !== JSON.stringify(payeesCurr.sort())){
              console.log('changed array');
            }

          });
        }

      }

      function init() {

        const prom = callDb();
        prom.then((e) => {
          addListeners();
        })

        const initialObj = {
          urlKeyMap: {
            [urlKey]:
              {users: false}
          },
          costMap: {[urlKey]: false}
        };

        function callDb(){
          return new Promise((resolve, reject) =>{
            db.ref('master').once('value', snapshot => {
              //if we don't have master node then create
              if (!snapshot.val()) {
                db.ref('master/').update(initialObj).then((e) => {
                  resolve();
                })
              }
              //if we don't have key then add it
              else {
                db.ref('master').child('urlKeyMap').once('value', snapshot2 => {
                  const urlKeyMap = (snapshot2.val() || {});
                  if (urlKeyMap && !(urlKey in urlKeyMap)) {

                    const prom1 = db.ref().child('/master/urlKeyMap/' + urlKey).set({users: false});
                    const prom2 = db.ref().child('/master/costMap/' + urlKey).set(false);
                    Promise.all([prom1, prom2]).then(() => {
                      resolve();
                    });

                  }
                  //if we're here then we have data for this urlKey so populate model
                  else {
                    createdDt = new Date();
                    const node = snapshot.val();
                    self.commaNames = node.urlKeyMap[urlKey].users.join(',');
                    const costMapUsers = node.costMap[urlKey];
                    Object.keys(costMapUsers).map((e, i) => {
                      self.payeeModel.push([]);
                      const currName = e;
                      const entry = costMapUsers[e];
                      let costArr;
                      //if the entry costs node is false then make costArr a blank array
                      if(!entry.costs || (entry.costs && entry.costs.includes(false))) {
                        costArr = [];
                      }
                      else {
                        costArr = entry.costs.map((e, i2) => {
                          //update payeeModel; if we don't have payees in the db just make it a blank array
                          self.payeeModel[i][i2] = Object.keys(e.payees || {});

                          return Object.assign({}, {
                            amount: e.amount,
                            what: e.what,
                            //payees is always costMap keys minus current user
                            payees: Object.keys(costMapUsers).filter( item => item !== currName)
                          }, {disabled: false});
                        });
                      }
                      const obj = {name: e, id: e.trim().replace(/\s+/g, '') + i, costs: costArr};
                      self.arrNames.push(obj);
                    });
                    resolve();

                  }
                })
              }
            });
          });
        }



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
