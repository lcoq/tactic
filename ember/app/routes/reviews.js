import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    if (!this.controllerFor('application').get('currentUser')) {
      this.transitionTo('login');
      return;
    }
  },

  model: function() {
    return this.controllerFor('reviews').loadEntries();
  },

  actions: {
    refresh: function() {
      this.refresh();
    }
  }
});
