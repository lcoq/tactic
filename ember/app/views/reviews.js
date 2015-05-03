import Ember from 'ember';

export default Ember.View.extend({
  initializeDatePickers: function() {
    this.$('.entry-filters .datepicker').datepicker({
      firstDay: 1,
      dateFormat: 'yy-mm-dd',
      prevText: '<',
      nextText: '>'
    });
  }.on('didInsertElement')
});