import Ember from 'ember';
import groupBy from '../utils/group-by';
import ProjectEntryList from '../models/project-entry-list';
import moment from 'moment';

export default  Ember.ArrayController.extend({
  needs: 'application',
  currentUserBinding: 'controllers.application.currentUser',

  itemController: 'entry',
  entriesByProject: groupBy('@this.@each.project', 'project', ProjectEntryList),

  projects: function() {
    return this.store.all('project');
  }.property(),

  selectedProjects: function() {
    return this.get('projects').toArray();
  }.property('projects.length'),

  users: function() {
    return this.store.all('user');
  }.property(),

  selectedUsers: function() {
    return [ this.get('currentUser') ];
  }.property('currentUser'),

  hasEdit: function() {
    return this.someProperty('isEditing');
  }.property('@each.isEditing'),

  startDate: function() {
    return moment().startOf('month').format('YYYY-MM-DD');
  }.property(),

  endDate: function() {
    return moment().format('YYYY-MM-DD');
  }.property(),

  startOrEndDateChanged: function() {
    this.send('refresh');
  }.observes('startDate', 'endDate'),

  loadEntries: function() {
    var userIds = this.get('selectedUsers').mapProperty('id');
    var projectIds = this.get('selectedProjects').mapProperty('id');
    var startDate = this.get('startDate');
    var endDate = this.get('endDate');

    var params = {
      user_ids: userIds,
      date_range: [ startDate, endDate ]
    };

    if (projectIds.get('length') !== this.get('projects.length')) {
      if (projectIds.get('length') === 0) {
        params.project = false;
      } else {
        params.project_ids = projectIds;
      }
    }
    return this.store.find('entry', params);
  },

  actions: {
    selectProjects: function(projects) {
      this.set('selectedProjects', projects);
      this.send('refresh');
    },
    selectUsers: function(users) {
      this.set('selectedUsers', users);
      this.send('refresh');
    }
  }
});
