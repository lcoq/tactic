import DS from 'ember-data';
import formatDuration from '../utils/format-duration';

export default DS.Model.extend({
  title: DS.attr('string'),
  startedAt: DS.attr('date'),
  finishedAt: DS.attr('date'),

  duration: function() {
    var durationInMs = this.get('finishedAt').getTime() - this.get('startedAt').getTime();
    return formatDuration(durationInMs);
  }.property('startedAt', 'finishedAt')
});
