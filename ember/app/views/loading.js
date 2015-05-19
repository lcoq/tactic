import Ember from 'ember';

export default Ember.View.extend({
  animate: function() {
    this.$('.loading-bg').animate({ opacity: 0.6 }, 3500);
  }.on('didInsertElement'),

  hide: function() {
    var clone = this.$().find('.loading').clone();
    this.$().parent().append(clone);

    function hideClone() {
      clone.remove();
    }
    clone.animate({ opacity: 0 }, { duration: 270, done: hideClone });
  }.on('willClearRender')
});
