import {
  moduleForModel,
  test
} from 'ember-qunit';
import Ember from 'ember';

moduleForModel('entry', 'Entry', {
  // Specify the other units that are required for this test.
  needs: [ 'model:Project' ]
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});

test('duration exists', function() {
  var model = this.subject(),
      startedAt = new Date('2015-01-01T11:00:00Z'),
      finishedAt = new Date('2015-01-01T13:24:37Z');
  Ember.run(function() {
    model.setProperties({
      startedAt: startedAt,
      finishedAt: finishedAt
    });
  });
  equal(model.get('duration'), (finishedAt.getTime() - startedAt.getTime()), 'The duration is properly computed');
});
