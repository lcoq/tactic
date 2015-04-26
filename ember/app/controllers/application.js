import Ember from 'ember';
import moment from 'moment';

export default Ember.Controller.extend({
  needs: 'index',

  entriesBinding: 'controllers.index.content',
  entriesInCurrentWeek: function() {
    var entries = this.get('entries'), startOfCurrentWeek = moment().startOf('isoWeek').toDate();
    return entries.filter(function(entry) {
      var startedAt = entry.get('startedAt');
      var entryDate = new Date(startedAt.getFullYear(), startedAt.getMonth(), startedAt.getDate());
      return (entryDate.getTime() - startOfCurrentWeek.getTime()) >= 0;
    });
  }.property('entries.@each.startedAt'),

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
  }.property('entries.@each.duration', 'entries.@each.project'),

  totalDurationInCurrentWeek: function() {
    var totalDuration = this.get('projectsDurationInCurrentWeek').reduce(function(previous, projectDuration) {
      return previous + projectDuration.get('duration');
    }, 0);
    return totalDuration;
  }.property('projectsDurationInCurrentWeek.@each.duration')
});
