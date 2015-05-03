import Ember from 'ember';

export default Ember.View.extend({
  initializeDatePickers: function() {
    this.$('.entry-filters .datepicker').datepicker({
      firstDay: 1,
      dateFormat: 'yy-mm-dd',
      prevText: '<',
      nextText: '>'
    });
  }.on('didInsertElement'),

  startDateChanged: function() {
    var startDate = this.get('controller.startDate'),
        endDateInput = this.$('.entry-filters .js-end-date');
    if (startDate && endDateInput) {
      endDateInput.datepicker('option', 'minDate', startDate);
    }
  }.observes('controller.startDate')
});
