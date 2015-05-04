import Ember from 'ember';

function arrayEquals(arr1, arr2) {
  return Ember.$(arr1).not(arr2).length === 0 && Ember.$(arr2).not(arr1).length === 0;
}

var ProjectItem = Ember.View.extend({
  projectSelected: function(key, value) {
    var project = this.get('project'), view = this.get('parentView');
    if (arguments.length === 2) {
      if (value) {
        view.get('selectedProjects').pushObject(project);
        return true;
      } else {
        view.get('selectedProjects').removeObject(project);
        return false;
      }
    }
    return view.get('selectedProjects').contains(project);
  }.property('project'),

  actions: {
    click: function() {
      this.toggleProperty('projectSelected');
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

  ProjectItem: ProjectItem
});
