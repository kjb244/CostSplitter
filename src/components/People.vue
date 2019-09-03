<template>
  <div class="container">

    <div class="row">
      <div class="col-sm-12">
        <input type="text" placeholder="person name" v-model="person"/>
        <input type="text" class="mt-2" placeholder="username" v-model="payAccount"/>
        <button type="button"  class="btn btn-primary mt-2" :disabled="person.length === 0 || (peopleList.length > 0  && peopleList.includes(person))" v-on:click="add()">Add</button>
      </div>
      <div class="col-sm-12" v-show="peopleList.length > 0">
        <table class="table mt-5">
          <tbody>
            <tr class="" v-for="(rec, index) in peopleList">
              <td class="people-container-rec">
                <div>{{rec}}</div>
                <a v-on:click="remove(index)">
                  <i class="fa fa-2x fa-times" aria-hidden="true"></i>
                </a>

              </td>

            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

</template>


<script>

  import firebase from 'firebase';
  require('font-awesome/css/font-awesome.css');
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';




  export default {
    name: 'people',
    components: {
    },
    props: {

    },
    data(){
      return{
        person: '',
        payAccount: '',
        peopleList: []
      }
    },
    watch: {
      peopleList(val){
        const peopleListGTOne = val.length > 1 ? true: false;
        if(peopleListGTOne){
          this.makeRoutesEnabled(['people','expenses','pay','logout']);
        }
        else {
          this.makeRoutesEnabled(['people','logout']);
        }

      }

    },
    methods: {
      ...mapActions([
        'makeRoutesEnabled'
      ]),
      dbAdd: function(person){
        const db = firebase.database();
        const urlKey = this.$route.query.urlKey;
        db.ref().child('/master/urlKeyMap/' + urlKey).update({users: this.peopleList});
        db.ref().child('/master/costMap/' + urlKey).update({[person]: false});
      },
      dbRemove: function(person){
        const db = firebase.database();
        const urlKey = this.$route.query.urlKey;
        db.ref().child('/master/urlKeyMap/' + urlKey).set({users: this.peopleList});
        db.ref().child('/master/costMap/' + urlKey).child(person).remove();
        const users = this.peopleList;
        //go through each cost node and remove people

        db.ref().child('/master/costMap/' + urlKey).once('value', snapshot => {
          const node = snapshot.val();
          Object.keys(node).map((name) => {
            node[name].costs.map((e2, i2)=> {
              const payees = Object.keys(e2.payees || {});
              const newPayees = payees.filter(e => users.includes(e));
              if(newPayees.length) {
                const obj = newPayees.reduce((accum, e) => {
                  accum[e] = false;
                  return accum;
                },{});
                db.ref().child(`/master/costMap/${urlKey}/${name}/costs/${i2}/payees`).set(obj);
              }
            })
          })
        });


      },
      add: function(){
        this.peopleList.push(this.person);
        this.dbAdd(this.person);
        this.person = '';

      },
      remove: function(index){
        const person = this.peopleList[index];
        this.peopleList.splice(index,1);
        this.dbRemove(person);
      }

    },
    created: function(){
      const db = firebase.database();
      const urlKey = this.$route.query.urlKey;
      const self = this;
      let createdDt = null;


      const prom = callDb();
      prom.then(() => {
        addListeners();
      });

      function addListeners(){
        db.ref(`master/costMap/${urlKey}`).off();
        db.ref(`master/costMap/${urlKey}`).on('child_removed', (snapshot) => {
          const listenerDate = new Date();
          if(listenerDate.getTime()/1000 - createdDt.getTime()/1000 <2){
            return false;
          }
          const key = snapshot.key;

          if(key){
            const idx = self.peopleList.indexOf(key);
            if(idx > -1){
              self.peopleList.splice(idx,1);
            }
          }

        });
        db.ref(`master/costMap/${urlKey}`).on('child_added', (snapshot) => {
          const listenerDate = new Date();
          if(listenerDate.getTime()/1000 - createdDt.getTime()/1000 <2){
            return false;
          }
          const key = snapshot.key;

          if(!self.peopleList.includes(key)){
            self.peopleList.push(key);
          }

        });

      }





      function callDb(){
        return new Promise((resolve, reject) => {

          const initialObj = {
            urlKeyMap: {
              [urlKey]:
                {users: false}
            },
            costMap: {[urlKey]: false}
          };

          db.ref('master').once('value', snapshot => {
            createdDt = new Date();
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
                  const node = snapshot.val();
                  self.peopleList = Object.keys(node.costMap[urlKey] || []);
                  resolve();
                }
              });
            }
          })
        });
      }



    },
    computed:{

    },

    mounted: function() {
    }
  }
</script>

<style scoped>

  input{
    text-indent: 10px;
    width: 100%;
  }

  button{
    width: 100%;
  }
  .people-container-rec{
    display: flex;
    justify-content: space-between;
  }

  i{
    font-size: 24px;
    color: #a28787;
  }

  a{
    cursor: pointer;
  }



</style>
