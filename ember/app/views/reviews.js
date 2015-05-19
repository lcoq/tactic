import Ember from 'ember';

function arrayEquals(arr1, arr2) {
  return Ember.$(arr1).not(arr2).length === 0 && Ember.$(arr2).not(arr1).length === 0;
}

var SelectableItem = Ember.View.extend({
  array: Ember.required(),
  item: Ember.required(),
  selected: function(key, value) {
    var item = this.get('item'), array = this.get('array');
    if (arguments.length === 2) {
      if (value) {
        array.pushObject(item);
        return true;
      } else {
        array.removeObject(item);
        return false;
      }
    }
    return array.contains(item);
  }.property('item'),

  actions: {
    click: function() {
      this.toggleProperty('selected');
    }
  }
});

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
  }.observes('controller.startDate'),

  selectedProjects: function() {
    return this.get('controller.selectedProjects').copy();
  }.property('controller.selectedProjects'),

  refreshOnProjectsFocusOut: function() {
    var view = this, controller = this.get('controller');
    this.$('.js-project-section').on('mouseleave', function() {
      var viewProjects = view.get('selectedProjects');
      if (!arrayEquals(controller.get('selectedProjects').mapProperty('id'), viewProjects.mapProperty('id'))) {
        controller.send('selectProjects', viewProjects);
      }
    });
  }.on('didInsertElement'),

  ProjectItem: SelectableItem.extend({ array: Ember.computed.alias('parentView.selectedProjects') }),

  selectedUsers: function() {
    return this.get('controller.selectedUsers').copy();
  }.property('controller.selectedUsers'),

  refreshOnUsersFocusOut: function() {
    var view = this, controller = this.get('controller');
    this.$('.js-user-section').on('mouseleave', function() {
      var viewUsers = view.get('selectedUsers');
      if (!arrayEquals(controller.get('selectedUsers').mapProperty('id'), viewUsers.mapProperty('id'))) {
        controller.send('selectUsers', viewUsers);
      }
    });
  }.on('didInsertElement'),

  UserItem: SelectableItem.extend({ array: Ember.computed.alias('parentView.selectedUsers') })
});
