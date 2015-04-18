import Ember from 'ember';
import EntryForm from '../models/entry-form';

export default Ember.ObjectController.extend({
  needs: 'index',

  isEditing: null,

  differedStartedAtDay: function() { return this.get('startedAtDay'); }.property(),
  differedStartedAtTime: function() { return this.get('startedAtTime'); }.property(),
  differedFinishedAtTime: function() { return this.get('finishedAtTime'); }.property(),

  // Used to restore an entry as ember-data does not restore
  // belongs_to relationship
  initialProject: null,
  setInitialProject: function() {
    this.set('initialProject', this.get('project'));
  }.on('init'),

  startedAtTime: function() {
    return this.get('startedAt').getTime();
  }.property('startedAt'),

  finishedAtTime: function() {
    return this.get('finishedAt').getTime();
  }.property('finishedAt'),

  projectNameChanged: function() {
    if (this.get('editForm.projectNameHasChanged')) {
      this.send('searchProjects');
    }
  }.observes('editForm.projectNameHasChanged'),

  projectTimer: null,

  deleteEntryTimer: null,
  isDeleting: Ember.computed.bool('deleteEntryTimer'),
  editFocus: null,

  saveEntryTimer: null,
  saveScheduled: Ember.computed.bool('saveEntryTimer'),

  _findProjects: function() {
    var editForm = this.get('editForm');
    this.store.find('project', { name: editForm.get('projectName') }).then(function(projects) {
      editForm.set('projectChoices', projects.toArray());
    });
  },

  actions: {
    editEntry: function(editFocus) {
      if (this.get('controllers.index.hasEdit')) {
        return;
      }
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
        editForm: EntryForm.create({ entry: this.get('content') }),
        isEditing: true
      });
    },
    scheduleSaveEntry: function() {
      var editForm = this.get('editForm');
      if (editForm.get('isValid')) {
        editForm.update();
        var saveTimer = Ember.run.later(this, function() { this.send('saveEntry'); }, 3000);
        this.setProperties({
          isEditing: false,
          saveEntryTimer: saveTimer
        });
      }
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
      this.setInitialProject();
      this.notifyPropertyChange('differedStartedAtDay');
      this.notifyPropertyChange('differedStartedAtTime');
      this.notifyPropertyChange('differedFinishedAtTime');
      this.setProperties({
        editForm: null,
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
    searchProjects: function() {
      var previousTimer = this.get('projectTimer');
      if (previousTimer) {
        Ember.run.cancel(previousTimer);
        this.set('projectTimer', null);
      }
      if (this.get('editForm.projectNameIsEmpty')) {
        this.send('selectProject', null);
      } else {
        var timer = Ember.run.later(this, this._findProjects, 700);
        this.set('projectTimer', timer);
      }
    },
    selectProject: function(project) {
      this.get('editForm').selectProject(project);
    }
  }
});
