import Ember from 'ember';
import formatDuration from '../utils/format-duration';
import groupBy from '../utils/group-by';
import EntryList from '../models/entry-list';

export default Ember.ArrayController.extend({
  needs: 'application',

  itemController: 'entry',

  entriesByDay: groupBy('@this.@each.differedStartedAtDay', 'differedStartedAtDay', EntryList),

  timerStarted: Ember.computed.notEmpty('newEntry.startedAt'),
  newEntry: null,
  newEntryDuration: '0:00:00',

  hasEdit: function() {
    return this.someProperty('isEditing');
  }.property('@each.isEditing'),

  // A change on `Entry#projectName` is unexpectedly sent by Ember while its value remains
  // the same. The hack below prevents firing observers when the project name does not really
  // change

  latestEntryProjectName: null,
  newEntryProjectNameChanged: function() {
    var newProjectName = this.get('newEntry.projectName');
    if (newProjectName !== this.get('latestEntryProjectName')) {
      this.set('latestEntryProjectName', newProjectName);
    }
  }.observes('newEntry.projectName').on('init'),

  newEntryProjectNameBinding: Ember.Binding.oneWay('latestEntryProjectName'),
  runSearchProjects: function() {
    if (this.get('newEntryProjectName') !== this.get('latestEntryProjectName')) {
      this.send('searchProjectsAndStartTimer');
    }
  }.observes('newEntryProjectName'),

  projectTimer: null,
  projectChoices: null,

  buildNewEntry: function() {
    var user = this.get('controllers.application.currentUser');
    var newEntry = this.store.createRecord('entry', { user: user });
    this.set('newEntry', newEntry);
  },

  _findProjects: function() {
    var projectName = this.get('newEntryProjectName');
    var self = this;
    this.store.find('project', { name: projectName }).then(function(projects) {
      self.set('projectChoices', projects.toArray());
    });
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
        self.buildNewEntry();
      });
    },
    searchProjectsAndStartTimer: function() {
      var previousTimer = this.get('projectTimer');
      if (previousTimer) {
        Ember.run.cancel(previousTimer);
        this.set('projectTimer', null);
      }
      if (!Ember.isEmpty(this.get('newEntryProjectName'))) {
        var timer = Ember.run.later(this, this._findProjects, 700);
        this.set('projectTimer', timer);
      } else {
        this.send('selectProject', null);
      }
      this.send('startTimer');
    },
    selectProject: function(project) {
      this.set('projectChoices', null);
      this.get('newEntry').set('project', project);
      this.notifyPropertyChange('latestEntryProjectName');
    }
  }
});
