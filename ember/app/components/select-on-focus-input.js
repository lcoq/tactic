import Ember from 'ember';

export default Ember.TextField.extend({
  selectOnFocus: function() {
    this.$().select();
  }.on('focusIn')
});
