import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: 'index',
  isEditing: null,

  actions: {
    editEntry: function() {
      this.set('isEditing', true);
    },
    saveEntry: function() {
      this.get('content').save();
      this.set('isEditing', false);
    },
    restoreEntry: function() {
      this.get('content').rollback();
      this.set('isEditing', false);
    },
    deleteEntry: function() {
      var index = this.get('controllers.index');
      this.get('content').destroyRecord().then(function() {
        index.send('refresh');
      });
    }
  }
});
