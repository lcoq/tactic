import Ember from 'ember';
import groupBy from '../utils/group-by';
import ProjectEntryList from '../models/project-entry-list';

export default  Ember.ArrayController.extend({
  itemController: 'entry',
  entriesByProject: groupBy('@this.@each.project', 'project', ProjectEntryList)
});
