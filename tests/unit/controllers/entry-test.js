import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:entry', 'EntryController', {
  // Specify the other units that are required for this test.
  needs: ['controller:index']
});

// Replace this with your real tests.
test('it exists', function() {
  var controller = this.subject();
  ok(controller);
});
