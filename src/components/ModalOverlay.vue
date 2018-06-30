<template>
  <section>
    <div  v-if="type === 'loadingdiv'">
      <div class="loading-text-animation" v-if="show">Loading...</div>
    </div>
    <div v-if="type === 'modal'" class="modal fade" id="loadingModal" tabindex="-1" role="dialog" aria-labelledby="loadingModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="loadingModalLabel">Modal title</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            ...
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary">Save changes</button>
          </div>
        </div>
      </div>

    </div>
  </section>




</template>


<script>
  export default {
    name: 'modaloverlay',
    props: ['modalprops'],
    data(){
      return{
        show: this.modalprops.show || false,
        type: this.modalprops.type || 'modal'
      }
    },
    watch: {
      'modalprops.show': function(newVal, oldVal){
        this.show = newVal;
        if(this.type === 'modal' && this.show){
          $('#loadingModal').modal('show');
        }
        else if(this.type === 'modal' && !this.show){
          $('#loadingModal').modal('hide');
        }


      }
    },
    methods: {




    },
    created: function(){

    },
    computed:{

    },
    mounted: function(){
      if(this.type === 'modal' && this.show){
        $('#loadingModal').modal('show');
      }
    }
  }
</script>

<style scoped>

  .loading-text-animation {
    opacity: 1;
    -webkit-animation: loadText 2s infinite linear;
    animation: loadText 2s infinite linear;
  }
  @-webkit-keyframes loadText {

    33%{
      opacity: .6;
    }
    66%{
      opacity: .2;
    }
    100%{
      opacity: 1;
    }

  }

  @keyframes loadText {
    33%{
      opacity: .6;
    }
    66%{
      opacity: .2;
    }
    100%{
      opacity: 1;
    }
  }

</style>
