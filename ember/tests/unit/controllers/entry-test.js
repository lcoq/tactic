import {
  moduleFor,
  test
} from 'ember-qunit';
import Ember from 'ember';

moduleFor('controller:entry', 'EntryController', {
  // Specify the other units that are required for this test.
  needs: ['controller:index']
});

// Replace this with your real tests.
test('it exists', function() {
  var entry = Ember.Object.create({startedAt: new Date(), finishedAt: new Date() });
  var controller = this.subject({ content: entry });
  ok(controller);
});
