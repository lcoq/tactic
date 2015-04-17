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

  startedAtDay: function() {
    return moment(this.get('startedAt')).format('YYYY-MM-DD');
  }.property('startedAt'),

  startedAtHour: function() {
    return moment(this.get('startedAt')).format('H:mm');
  }.property('startedAt'),

  finishedAtHour: function() {
    return moment(this.get('finishedAt')).format('H:mm');
  }.property('finishedAt'),

  startedAtHourOneWayBinding: Ember.Binding.oneWay('startedAtHour'),
  finishedAtHourOneWayBinding: Ember.Binding.oneWay('finishedAtHour'),

  // A change on `Entry#projectName` is unexpectedly sent by Ember while its value remains
  // the same. The hack below prevents firing observers when the project name does not really
  // change
  latestProjectName: null,
  projectNameChanged: function() {
    var newProjectName = this.get('projectName');
    if (newProjectName !== this.get('latestProjectName')) {
      var self = this;
      Ember.run(function() { self.set('latestProjectName', newProjectName); });
    }
  }.observes('content.projectName').on('init'),
  projectNameOneWayBinding: Ember.Binding.oneWay('latestProjectName'),

  projectTimer: null,
  projectChoices: null,

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
      this.get('content').destroyRecord();
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
    },
    searchProjects: function() {
      var previousTimer = this.get('projectTimer');
      if (previousTimer) {
        Ember.run.cancel(previousTimer);
        this.set('projectTimer', null);
      }
      var timer = Ember.run.later(this, function() {
        var projectName = this.get('projectName');
        var self = this;
        this.store.find('project', { name: projectName }).then(function(projects) {
          self.set('projectChoices', projects.toArray());
        });
      }, 700);
      this.set('projectTimer', timer);
    },
    selectProject: function(project) {
      this.set('projectChoices', null);
      this.set('project', project);
    }
  }
});
