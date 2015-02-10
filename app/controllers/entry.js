import Ember from 'ember';
import moment from 'moment';

function updateHoursAndMinutes(date, hours, minutes) {
  var newDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes
  );
  if (!isNaN(newDate.getTime())) {
    return newDate;
  }
}

export default Ember.ObjectController.extend({
  needs: 'index',
  isEditing: null,

  startedAtHour: function() {
    return moment(this.get('startedAt')).format('H:mm');
  }.property('startedAt'),

  finishedAtHour: function() {
    return moment(this.get('finishedAt')).format('H:mm');
  }.property('finishedAt'),

  startedAtHourOneWayBinding: Ember.Binding.oneWay('startedAtHour'),
  finishedAtHourOneWayBinding: Ember.Binding.oneWay('finishedAtHour'),

  actions: {
    editEntry: function() {
      this.set('isEditing', true);
    },
    saveEntry: function() {
      this.get('content').save();
      this.set('isEditing', false);
    },
    restoreEntry: function() {
      this.get('content').rollback();
      this.set('isEditing', false);
    },
    deleteEntry: function() {
      var index = this.get('controllers.index');
      this.get('content').destroyRecord().then(function() {
        index.send('refresh');
      });
    },
    startedAtHourChanged: function(string) {
      var split = string.split(':');
      var newValue = updateHoursAndMinutes(this.get('startedAt'), split[0], split[1]);
      this.get('content').set('startedAt', newValue);
    },
    finishedAtHourChanged: function(string) {
      var split = string.split(':');
      var newValue = updateHoursAndMinutes(this.get('finishedAt'), split[0], split[1]);
      this.get('content').set('finishedAt', newValue);
    }
  }
});
