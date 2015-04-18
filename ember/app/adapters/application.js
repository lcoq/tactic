import DS from 'ember-data';
import Ember from 'ember';

export default DS.RESTAdapter.extend({
  namespace: 'api',
  pathForType: function(type) {
    return Ember.String.dasherize(this._super(type));
  }
});
