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
  var model = this.subject();
  Ember.run(function() {
    model.setProperties({
      startedAt: new Date('2015-01-01T11:00:00Z'),
      finishedAt: new Date('2015-01-01T13:24:37Z')
    });
  });
  equal(model.get('duration'), '2:24:37', 'The duration is properly formatted');
});

test('duration minutes and seconds have 2 numbers', function() {
  var model = this.subject();
  Ember.run(function() {
    model.setProperties({
      startedAt: new Date('2015-01-01T11:00:00Z'),
      finishedAt: new Date('2015-01-01T13:00:00Z')
    });
  });
  equal(model.get('duration'), '2:00:00');
});
