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

function updateYearMonthAndDay(date, year, month, day) {
  var newDate = new Date(
    year,
    parseInt(month) - 1,
    day,
    date.getHours(),
    date.getMinutes()
  );
  if (!isNaN(newDate.getTime())) {
    return newDate;
  }
}

function updateDateProperty(object, propertyName, newValue) {
  var initialValue = object.get(propertyName);
  if (!initialValue || !newValue) {
    if (initialValue !== newValue) {
      object.set(propertyName, newValue);
    }
  } else if (initialValue.getTime() !== newValue.getTime()) {
    object.set(propertyName, newValue);
  }
}

export default Ember.ObjectController.extend({
  needs: 'index',
  isEditing: null,

  initialStartedAtDay: null,
  setInitialStartedAtDay: function() {
    var startedAtDay = moment(this.get('startedAt')).format('YYYY-MM-DD');
    this.set('initialStartedAtDay', startedAtDay);
  }.on('init'),

  initialStartedAtTime: null,
  setInitialStartedAtTime: function() {
    var startedAt = this.get('startedAt');
    if (startedAt) {
      this.set('initialStartedAtTime', startedAt.getTime());
    }
  }.on('init'),

  startedAtDay: function() {
    return moment(this.get('startedAt')).format('YYYY-MM-DD');
  }.property('startedAt'),

  startedAtDayOneWayBinding: Ember.Binding.oneWay('startedAtDay'),

  startedAtHour: function() {
    return moment(this.get('startedAt')).format('H:mm');
  }.property('startedAt'),

  finishedAtHour: function() {
    return moment(this.get('finishedAt')).format('H:mm');
  }.property('finishedAt'),

  startedAtHourOneWayBinding: Ember.Binding.oneWay('startedAtHour'),
  finishedAtHourOneWayBinding: Ember.Binding.oneWay('finishedAtHour'),

  initialProject: null,
  setInitialProject: function() {
    this.set('initialProject', this.get('project'));
  }.on('init'),

  // A change on `Entry#projectName` is unexpectedly sent by Ember while its value remains
  // the same. The hack below prevents firing observers when the project name does not really
  // change
  entryProjectName: null,
  entryProjectNameChanged: function() {
    var newProjectName = this.get('content.projectName');
    if (newProjectName !== this.get('entryProjectName')) {
      var self = this;
      Ember.run(function() { self.set('entryProjectName', newProjectName); });
    }
  }.observes('content.projectName').on('init'),

  projectNameBinding: Ember.Binding.oneWay('entryProjectName'),
  projectNameEnteredChanged: function() {
    if (this.get('projectName') !== this.get('entryProjectName')) {
      this.send('searchProjects');
    }
  }.observes('projectName'),

  projectTimer: null,
  projectChoices: null,

  deleteEntryTimer: null,
  isDeleting: Ember.computed.bool('deleteEntryTimer'),
  editFocus: null,

  saveEntryTimer: null,
  saveScheduled: Ember.computed.bool('saveEntryTimer'),

  _findProjects: function() {
    var projectName = this.get('projectName');
    var self = this;
    this.store.find('project', { name: projectName }).then(function(projects) {
      self.set('projectChoices', projects.toArray());
    });
  },

  actions: {
    editEntry: function(editFocus) {
      var saveTimer = this.get('saveEntryTimer');
      if (saveTimer) {
        Ember.run.cancel(saveTimer);
        this.set('saveEntryTimer', null);
      }
      var deleteTimer = this.get('deleteEntryTimer');
      if (deleteTimer) {
        this.send('cancelDeleteEntry');
      }
      this.setProperties({
        editFocus: editFocus,
        isEditing: true
      });
    },
    scheduleSaveEntry: function() {
      var saveTimer = Ember.run.later(this, function() { this.send('saveEntry'); }, 3000);
      this.setProperties({
        isEditing: false,
        saveEntryTimer: saveTimer
      });
    },
    cancelSaveEntry: function() {
      var saveTimer = this.get('saveEntryTimer');
      if (saveTimer) {
        Ember.run.cancel(saveTimer);
        this.set('saveEntryTimer', null);
        this.send('restoreEntry');
      }
    },
    saveEntry: function() {
      this.get('content').save();
      this.setInitialStartedAtDay();
      this.setInitialStartedAtTime();
      this.setInitialProject();
      this.setProperties({
        isEditing: false,
        saveEntryTimer: null
      });
    },
    restoreEntry: function() {
      this.set('project', this.get('initialProject'));
      this.get('content').rollback();
      this.set('isEditing', false);
    },
    deleteEntry: function() {
      function deleteEntry() {
        this.set('deleteEntryTimer', null);
        this.get('content').destroyRecord();
      }
      var deleteEntryTimer = Ember.run.later(this, deleteEntry, 5000);
      this.set('deleteEntryTimer', deleteEntryTimer);
    },
    cancelDeleteEntry: function() {
      var deleteTimer = this.get('deleteEntryTimer');
      if (deleteTimer) {
        Ember.run.cancel(deleteTimer);
        this.set('deleteEntryTimer', null);
      }
    },
    dayChanged: function(string) {
      var split = string.split('-');
      var newStartedAt = updateYearMonthAndDay(this.get('startedAt'), split[0], split[1], split[2]),
          newFinishedAt = updateYearMonthAndDay(this.get('finishedAt'), split[0], split[1], split[2]);
      updateDateProperty(this.get('content'), 'startedAt', newStartedAt);
      updateDateProperty(this.get('content'), 'finishedAt', newFinishedAt);
    },
    startedAtHourChanged: function(string) {
      var split = string.split(':');
      var newValue = updateHoursAndMinutes(this.get('startedAt'), split[0], split[1]);
      updateDateProperty(this.get('content'), 'startedAt', newValue);
    },
    finishedAtHourChanged: function(string) {
      var split = string.split(':');
      var newValue = updateHoursAndMinutes(this.get('finishedAt'), split[0], split[1]);
      updateDateProperty(this.get('content'), 'finishedAt', newValue);
    },
    searchProjects: function() {
      var previousTimer = this.get('projectTimer');
      if (previousTimer) {
        Ember.run.cancel(previousTimer);
        this.set('projectTimer', null);
      }
      if (!Ember.isEmpty(this.get('projectName'))) {
        var timer = Ember.run.later(this, this._findProjects, 700);
        this.set('projectTimer', timer);
      } else {
        this.send('selectProject', null);
      }
    },
    selectProject: function(project) {
      this.setProperties({
        projectChoices: null,
        project: project
      });
      this.notifyPropertyChange('entryProjectName');
    }
  }
});
