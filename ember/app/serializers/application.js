import DS from 'ember-data';
import Ember from 'ember';

export default DS.RESTSerializer.extend({
  keyForAttribute: function(attribute) {
    return Ember.String.underscore(attribute);
  }
});
