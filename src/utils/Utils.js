

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

  randomString = (size) => {
    size = size || 10;
    const charArr = 'abcdefghijklmnopqrstuvwzyz0123456789'.split('');
    let rtnStr = '';
    for(let i= 0; i<size; i++){
      rtnStr += charArr[Math.floor(Math.random() * charArr.length)];
    }
    return rtnStr;

  }

  goBackLogic = () => {
    let hash = window.location.hash;
    if (hash.includes('users')){
      hash = '/';
    }
    else if (hash.includes('calculate')){
      hash = hash.replace('calculate','users');
    }
    window.location.hash = hash;
  }






}

const utils = new Utils();

export default utils;
