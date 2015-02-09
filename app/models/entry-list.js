import DS from 'ember-data';

var EntryList = DS.Model.extend({
  date: DS.attr('date', { defaultValue: function() { return new Date(); } }),
  entries: DS.hasMany('Entry', { async: true }),

  isRecent: function() {
    var date = this.get('date'), now = new Date();
    return (now - date.getTime()) < 3600 * 24 * 7;
  }.property('date')
});

EntryList.reopenClass({
  FIXTURES: [
    {
      id: 1,
      date: new Date('2015/02/09'),
      entries: [ 2, 3 ]
    }, {
      id: 2,
      date: new Date('2015/02/08'),
      entries: [ 1 ]
    }
  ]
});

export default EntryList;
