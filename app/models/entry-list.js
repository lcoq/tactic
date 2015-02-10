import DS from 'ember-data';
import formatDuration from '../utils/format-duration';

export default DS.Model.extend({
  date: DS.attr('date', { defaultValue: function() { return new Date(); } }),
  entries: DS.hasMany('Entry'),

  duration: function() {
    var durationInMs = this.get('entries').reduce(function(duration, entry) {
      return duration + (entry.get('finishedAt').getTime() - entry.get('startedAt').getTime());
    }, 0);
    return formatDuration(durationInMs);
  }.property('entries.@each.startedAt', 'entries.@each.finishedAt'),

  isRecent: function() {
    var date = this.get('date'), now = new Date();
    return (now - date.getTime()) < 3600 * 24 * 7;
  }.property('date')
});
