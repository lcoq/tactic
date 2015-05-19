import Ember from 'ember';

export default Ember.ArrayProxy.extend(Ember.SortableMixin, {
  content: null,
  key: null,
  sortProperties: ['startedAtTime'],
  sortAscending: false,

  project: Ember.computed.alias('key'),

  duration: function() {
    return this.get('content').reduce(function(duration, entry) {
      return duration + entry.get('duration');
    }, 0);
  }.property('content.@each.duration'),

  isBefore: function() {
    return false;
  }
});
