import formatDuration from '../utils/format-duration';
import Ember from 'ember';
import moment from 'moment';

export default Ember.ArrayProxy.extend(Ember.SortableMixin, {
  content: null,
  key: null,
  sortProperties: ['initialStartedAtTime'],
  sortAscending: false,

  date: function() {
    var key = this.get('key');
    return new Date(key);
  }.property('key'),

  isBefore: function(otherEntryList) {
    var date = this.get('date'),
        otherDate = otherEntryList.get('date');
    return date < otherDate;
  },

  mostRecentDate: function() {
    return this.get('content').mapProperty('initialStartedAt').sort().get('firstObject');
  }.property('content.@each.startedAt'),

  duration: function() {
    var startedAt, finishedAt, durationInMs;

    durationInMs = this.get('content').reduce(function(duration, entry) {
      finishedAt = entry.get('finishedAt');
      startedAt = entry.get('startedAt');
      if (finishedAt && startedAt) {
        return duration + finishedAt.getTime() - startedAt.getTime();
      } else {
        return duration;
      }
    }, 0);
    return formatDuration(durationInMs);
  }.property('content.@each.startedAt', 'content.@each.finishedAt'),

  isToday: function() {
    var mostRecentDate = this.get('mostRecentDate');
    return moment(mostRecentDate).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD');
  }.property('mostRecentDate'),

  inCurrentWeek: function() {
    var mostRecentDate = this.get('mostRecentDate'), now = new Date();
   return (now.getTime() - mostRecentDate.getTime()) < 1000 * 3600 * 24 * 7;
  }.property('mostRecentDate')
});
