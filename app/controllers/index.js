import Ember from 'ember';

export default Ember.ArrayController.extend({
  timerStarted: Ember.computed.notEmpty('newEntry.startedAt'),

  buildNewEntry: function() {
    this.set('newEntry', this.store.createRecord('entry'));
  },

  actions: {
    startTimer: function() {
      this.get('newEntry').set('startedAt', new Date());
    },
    stopTimer: function() {
      var newEntry = this.get('newEntry'),
          self = this;
      newEntry.set('finishedAt', new Date());
      newEntry.save().then(function() {
        self.send('refresh');
        self.buildNewEntry();
      });
    }
  }
});
