

class Utils{

  vueStore = {
    store: {},
    getStore(key){
      return this.store[key] || null;
    },

    setStore(key, value){
      this.store[key] = value;
    },

    getKeys(){
      return Object.keys(this.store);
    },


  }




}

const utils = new Utils();

export default utils;
