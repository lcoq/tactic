import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.store.find('user');
  },

  actions: {
    chooseUser: function(user) {
      this.controllerFor('application').set('currentUser', user);
      this.transitionTo('index');
    }
  }
});
