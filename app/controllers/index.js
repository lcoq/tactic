import Ember from 'ember';

export default Ember.ArrayController.extend({
  timerStarted: Ember.computed.notEmpty('newEntry.startedAt'),

  actions: {
    startTimer: function() {
      var newEntry = this.get('newEntry');
      newEntry.set('startedAt', new Date());
    },
    stopTimer: function() {
      var newEntry = this.get('newEntry'),
          self = this;
      newEntry.set('finishedAt', new Date());
      newEntry.save().then(function() {
        self.send('refresh');
        self.send('buildNewEntry');
      });
    },
    buildNewEntry: function() {
      var newEntry = this.store.createRecord('entry');
      this.set('newEntry', newEntry);
    },
    saveEntry: function(entry) {
      entry.save();
    }
  }
});
