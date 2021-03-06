import Ember from 'ember';
import moment from 'moment';

export default Ember.ArrayProxy.extend(Ember.SortableMixin, {
  content: null,
  key: null,
  sortProperties: ['differedStartedAtTime'],
  sortAscending: false,

  date: function() {
    var split = this.get('key').split('-');
    return new Date(split[0], parseInt(split[1])-1, split[2]);
  }.property('key'),

  isBefore: function(otherEntryList) {
    var date = this.get('date'),
        otherDate = otherEntryList.get('date');
    return date < otherDate;
  },

  time: function() {
    return this.get('content.lastObject.startedAt');
  }.property('content.lastObject.startedAt'),

  duration: function() {
    var startedAt, finishedAt;

    return this.get('content').reduce(function(duration, entry) {
      finishedAt = entry.get('differedFinishedAtTime');
      startedAt = entry.get('differedStartedAtTime');
      if (finishedAt && startedAt) {
        return duration + finishedAt - startedAt;
      } else {
        return duration;
      }
    }, 0);
  }.property('content.@each.differedStartedAtTime', 'content.@each.differedFinishedAtTime'),

  isToday: function() {
    return moment(this.get('date')).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD');
  }.property('date'),

  inCurrentWeek: function() {
    var date = this.get('date'), now = new Date();
   return (now.getTime() - date.getTime()) < 1000 * 3600 * 24 * 7;
  }.property('date')
});
