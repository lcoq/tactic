import Ember from 'ember';
import formatDuration from '../utils/format-duration';

export default Ember.ArrayController.extend({
  timerStarted: Ember.computed.notEmpty('newEntry.startedAt'),
  newEntry: null,
  newEntryDuration: '0:00:00',

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

  projectTimer: null,
  projectChoices: null,

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
    },
    searchProjectsAndStartTimer: function() {
      var previousTimer = this.get('projectTimer');
      if (previousTimer) {
        Ember.run.cancel(previousTimer);
        this.set('projectTimer', null);
      }
      var timer = Ember.run.later(this, function() {
        var projectName = this.get('newEntryProjectName');
        var self = this;
        this.store.find('project', { name: projectName }).then(function(projects) {
          self.set('projectChoices', projects.toArray());
        });
      }, 700);

      this.set('projectTimer', timer);
      this.send('startTimer');
    },
    selectProject: function(project) {
      this.set('projectChoices', null);
      this.get('newEntry').set('project', project);
    }
  }
});
