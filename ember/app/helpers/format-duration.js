import Ember from 'ember';
import formatDuration from '../utils/format-duration';

export default Ember.Handlebars.makeBoundHelper( function(value) {
  return new Ember.Handlebars.SafeString(formatDuration(value));
});
