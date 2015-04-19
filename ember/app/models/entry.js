import DS from 'ember-data';
import formatDuration from '../utils/format-duration';
import moment from 'moment';

export default DS.Model.extend({
  title: DS.attr('string'),
  startedAt: DS.attr('date'),
  finishedAt: DS.attr('date'),
  project: DS.belongsTo('Project'),

  duration: function() {
    var startedAt = this.get('startedAt'),
        finishedAt = this.get('finishedAt');
    if (startedAt && finishedAt) {
      return formatDuration(finishedAt.getTime() - startedAt.getTime());
    }
  }.property('startedAt', 'finishedAt'),

  projectName: function() {
    return this.get('project.name');
  }.property('project.name'),

  startedAtDay: function() {
    return moment(this.get('startedAt')).format('YYYY-MM-DD');
  }.property('startedAt'),

  startedAtHour: function() {
    return moment(this.get('startedAt')).format('H:mm');
  }.property('startedAt'),

  finishedAtHour: function() {
    return moment(this.get('finishedAt')).format('H:mm');
  }.property('finishedAt')
});
