import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.store.find('entry-list');
  },

  setupController: function(controller) {
    this._super.apply(this, arguments);
    controller.send('buildNewEntry');
  },

  actions: {
    refresh: function() {
      this.refresh();
    }
  }
});
