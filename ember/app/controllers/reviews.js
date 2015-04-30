import Ember from 'ember';
import groupBy from '../utils/group-by';
import ProjectEntryList from '../models/project-entry-list';
import moment from 'moment';

export default  Ember.ArrayController.extend({
  needs: 'application',
  currentUserBinding: 'controllers.application.currentUser',

  itemController: 'entry',
  entriesByProject: groupBy('@this.@each.project', 'project', ProjectEntryList),

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
    var userId = this.get('currentUser.id');
    var startDate = moment(this.get('startDate'));
    var endDate = moment(this.get('endDate'));
    return this.store.filter('entry', function(entry) {
      return entry.get('startedAt') &&
        entry.get('finishedAt') &&
        entry.get('user.id') === userId &&
        ( startDate.isBefore(entry.get('startedAt')) || startDate.isSame(entry.get('startedAt')) ) &&
        ( endDate.isAfter(entry.get('finishedAt')) || endDate.isSame(entry.get('finishedAt')) );
    });
  }
});
