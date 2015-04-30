import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    if (!this.controllerFor('application').get('currentUser')) {
      this.transitionTo('login');
      return;
    }
  },

  model: function() {
    var userId = this.controllerFor('application').get('currentUser.id');
    return this.store.filter('entry', function(entry) {
      return entry.get('startedAt') && entry.get('finishedAt') && entry.get('user.id') === userId;
    });
  }
});
