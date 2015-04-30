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
    var entries = this.get('entriesInCurrentWeek');
    var projects = entries.mapProperty('project').uniq();
    var projectsDuration = projects.map(function(project) {
      var projectId = project ? project.get('id') : null;
      var duration = entries.filterProperty('project.id', projectId).reduce(function(previous, entry) {
        return previous + entry.get('duration');
      }, 0);
      return Ember.Object.create({ project: project, duration: duration });
    });
    return projectsDuration.sortBy('duration').reverse();
  }.property('entriesInCurrentWeek.@each.duration', 'entriesInCurrentWeek.@each.project'),

  totalDurationInCurrentWeek: function() {
    var totalDuration = this.get('projectsDurationInCurrentWeek').reduce(function(previous, projectDuration) {
      return previous + projectDuration.get('duration');
    }, 0);
    return totalDuration;
  }.property('projectsDurationInCurrentWeek.@each.duration')
});
