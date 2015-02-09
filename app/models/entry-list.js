import DS from 'ember-data';

export default DS.Model.extend({
  date: DS.attr('date', { defaultValue: function() { return new Date(); } }),
  entries: DS.hasMany('Entry'),

  isRecent: function() {
    var date = this.get('date'), now = new Date();
    return (now - date.getTime()) < 3600 * 24 * 7;
  }.property('date')
});
