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
    },
    refresh: function() {
      this.refresh();
    }
  }
});
