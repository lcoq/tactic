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
  }.on('didInsertElement'),

  mouseUpEventName: function() {
    return 'mouseup.' + this.get('elementId');
  }.property('elementId'),

  setScheduleSaveOnMouseUp: function() {
    var self = this, eventName = this.get('mouseUpEventName');
    Ember.$(document).on(eventName, function(event) {
      if (self.$().has(event.target).length === 0) {
        self.get('controller').send('scheduleSaveEntry');
      }
    });
  }.on('didInsertElement'),

  removeScheduleSaveOnMouseUp: function() {
    var eventName = this.get('mouseUpEventName');
    Ember.$(document).off(eventName);
  }.on('willClearRender')
});
