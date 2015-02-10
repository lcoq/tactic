import Ember from 'ember';
import formatDuration from '../utils/format-duration';

export default Ember.ArrayController.extend({
  timerStarted: Ember.computed.notEmpty('newEntry.startedAt'),
  newEntry: null,
  newEntryDuration: '0:00:00',

  buildNewEntry: function() {
    this.set('newEntry', this.store.createRecord('entry'));
  },

  actions: {
    startTimer: function() {
      if (this.get('newEntry.startedAt')) {
        return;
      }

      var startedAt = new Date();
      this.get('newEntry').set('startedAt', startedAt);

      function updateDuration() {
        if (startedAt === this.get('newEntry.startedAt')) {
          var newDuration = formatDuration(new Date().getTime() - startedAt.getTime());
          this.set('newEntryDuration', newDuration);
          Ember.run.later(this, updateDuration, 500);
        } else {
          this.set('newEntryDuration', '0:00:00');
        }
      }
      updateDuration.call(this);
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
