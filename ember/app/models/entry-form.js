import moment from 'moment';
import Ember from 'ember';

export default Ember.Object.extend({
  entry: null,

  // A change on `Entry#projectName` is unexpectedly sent by Ember while its value remains
  // the same. The hack below prevents firing observers when the project name does not really
  // change
  entryProjectName: function() {
    return this.get('entry.project.name');
  }.property(),
  entryProjectNameChanged: function() {
    var entryProjectName = this.get('entry.project.name');
    if (entryProjectName !== this.get('entryProjectName')) {
      this.set('entryProjectName', entryProjectName);
    }
  }.observes('entry.project.name'),

  projectNameBinding: Ember.Binding.oneWay('entryProjectName'),
  projectNameHasChanged: function() {
    return this.get('projectName') !== this.get('project.name');
  }.property('projectName'),
  projectNameIsEmpty: Ember.computed.empty('projectName'),
  projectBinding: Ember.Binding.oneWay('entry.project'),

  titleBinding: Ember.Binding.oneWay('entry.title'),
  startedAtDayBinding: Ember.Binding.oneWay('entry.startedAtDay'),
  startedAtHourBinding: Ember.Binding.oneWay('entry.startedAtHour'),
  finishedAtHourBinding: Ember.Binding.oneWay('entry.finishedAtHour'),

  startedAt: function() {
    var day = this.get('startedAtDay'), hour = this.get('startedAtHour');
    return moment(day + ' ' + hour, 'YYYY-MM-DD HH:mm').toDate();
  }.property('startedAtDay', 'startedAtHour'),

  finishedAt: function() {
    var day = this.get('startedAtDay'), hour = this.get('finishedAtHour');
    return moment(day + ' ' + hour, 'YYYY-MM-DD HH:mm').toDate();
  }.property('startedAtDay', 'finishedAtHour'),

  dayIsValid: function() {
    return moment(this.get('startedAtDay'), 'YYYY-MM-DD').isValid();
  }.property('startedAtDay'),

  startedAtIsValid: function() {
    return moment(this.get('startedAtHour'), 'HH:mm').isValid();
  }.property('startedAtHour'),

  finishedAtHourIsValid: function() {
    return moment(this.get('finishedAtHour'), 'HH:mm').isValid();
  }.property('finishedAtHour'),

  startedAtIsBeforeFinishedAt: function() {
    return this.get('startedAt').getTime() <= this.get('finishedAt').getTime();
  }.property('startedAt', 'finishedAt'),

  finishedAtIsValid: Ember.computed.and('finishedAtHourIsValid', 'startedAtIsBeforeFinishedAt'),
  isValid: Ember.computed.and('dayIsValid', 'startedAtIsValid', 'finishedAtIsValid'),

  projectChoices: null,

  selectProject: function(project) {
    this.setProperties({
      projectChoices: null,
      project: project
    });
    if (project) {
      this.set('projectName', project.get('name'));
    }
  },

  update: function() {
    var updatedProperties = this.getProperties('title', 'startedAt', 'finishedAt', 'project');
    this.get('entry').setProperties(updatedProperties);
  }
});
