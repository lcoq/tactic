import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    if (!this.controllerFor('application').get('currentUser')) {
      this.transitionTo('login');
      return;
    }
    this.store.find('entry');
  },

  model: function() {
    var userId = this.controllerFor('application').get('currentUser.id');
    return this.store.filter('entry', function(entry) {
      return entry.get('startedAt') && entry.get('finishedAt') && entry.get('user.id') === userId;
    });
  },

  setupController: function(controller) {
    this._super.apply(this, arguments);
    controller.buildNewEntry();
  },

  actions: {
    willTransition: function(transition) {
      if (transition.data.restored) {
        return;
      }
      transition.abort();

      var promises = this.controller.filterProperty('saveScheduled').map(function(entry) {
        return entry.runPendingSave();
      });

      this.render('loading', { outlet: 'loading' });

      Ember.RSVP.all(promises).then(function() {
        transition.data.restored = true;
        transition.retry();
      }, function() {
        // an entry cannot be saved
      });
    }
  }
});
