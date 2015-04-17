import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    this.store.find('entry');
  },

  model: function() {
    return this.store.filter('entry', function(entry) {
      return entry.get('startedAt') && entry.get('finishedAt');
    });
  },

  setupController: function(controller) {
    this._super.apply(this, arguments);
    controller.buildNewEntry();
  }
});
