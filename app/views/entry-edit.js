import Ember from 'ember';

export default Ember.View.extend({
  templateName: 'entry-edit',
  tagName: 'li',
  classNames: 'entry entry-edit',
  focusOn: null,

  becomeFocused: function() {
    var focusOn = this.get('focusOn');
    if (focusOn) {
      this.$('.focus-' + focusOn).focus();
    }
  }.on('didInsertElement')
});
