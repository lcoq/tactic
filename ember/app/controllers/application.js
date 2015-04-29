import Ember from 'ember';
import moment from 'moment';

function isFilled(entry) {
  return entry.get('startedAt') && entry.get('finishedAt');
}

function isInCurrentWeek(entry, startOfWeek) {
  var startedAt = entry.get('startedAt');
  var date = new Date(startedAt.getFullYear(), startedAt.getMonth(), startedAt.getDate());
  return (date.getTime() - startOfWeek.getTime()) >= 0;
}

function belongsTo(entry, user) {
  return entry.get('user.id') === user.id;
}

function projectsDuration(entries) {
  var projects = entries.mapProperty('project').uniq(), projectEntries, duration;
  return projects.map(function(project) {
    projectEntries = entries.filterProperty('project.id', project ? project.get('id') : null);
    duration = projectEntries.reduce(function(s, entry) { return s + entry.get('duration'); }, 0);
    return Ember.Object.create({ project: project, duration: duration });
  }).sortBy('duration').reverse();
}

function totalProjectsDuration(durations) {
  return durations.reduce(function(s, projectDuration) { return s + projectDuration.get('duration'); }, 0);
}

export default Ember.Controller.extend({
  needs: 'index',

  currentUser: null,

  entriesInCurrentWeek: function() {
    var startOfCurrentWeek = moment().startOf('isoWeek').toDate();
    return this.store.filter('entry', function(entry) {
      return isFilled(entry) && isInCurrentWeek(entry, startOfCurrentWeek);
    });
  }.property(),

  projectsDurationInCurrentWeek: function() {
    return projectsDuration(this.get('entriesInCurrentWeek'));
  }.property('entriesInCurrentWeek.@each.duration', 'entriesInCurrentWeek.@each.project'),

  totalDurationInCurrentWeek: function() {
    return totalProjectsDuration(this.get('projectsDurationInCurrentWeek'));
  }.property('projectsDurationInCurrentWeek.@each.duration'),

  myEntriesInCurrentWeek: function() {
    var startOfCurrentWeek = moment().startOf('isoWeek').toDate(), user = this.get('currentUser');
    return this.store.filter('entry', function(entry) {
      return isFilled(entry) && belongsTo(entry, user) && isInCurrentWeek(entry, startOfCurrentWeek);
    });
  }.property('currentUser'),

  myProjectsDurationInCurrentWeek: function() {
    return projectsDuration(this.get('myEntriesInCurrentWeek'));
  }.property('myEntriesInCurrentWeek.@each.duration', 'myEntriesInCurrentWeek.@each.project'),

  myTotalDurationInCurrentWeek: function() {
    return totalProjectsDuration(this.get('myProjectsDurationInCurrentWeek'));
  }.property('myProjectsDurationInCurrentWeek.@each.duration')
});
