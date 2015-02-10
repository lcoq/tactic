import DS from 'ember-data';
import formatDuration from '../utils/format-duration';

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
  }.property('project.name')
});
