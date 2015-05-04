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

  setupController: function(controller, model) {
    this._super(controller, model);
    return this.store.find('project');
  },

  actions: {
    refresh: function() {
      this.refresh();
    }
  }
});
