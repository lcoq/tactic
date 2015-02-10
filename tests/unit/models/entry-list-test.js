import {
  moduleForModel,
  test
} from 'ember-qunit';
import Ember from 'ember';

moduleForModel('entry-list', 'EntryList', {
  // Specify the other units that are required for this test.
  needs: [ 'model:Entry', 'model:Project' ]
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});


test('it is recent', function() {
  var model = this.subject();
  ok(model.get('isRecent'));
});

test('is is not recent 7 days ago', function() {
  var model = this.subject(),
      oldDate = new Date().getTime() - 3600 * 24 * 8;
  Ember.run(function() { model.set('date', new Date(oldDate)); });
  ok(!model.get('isRecent'));
});

test('it duration is the sum of its entries durations', function() {
  var model = this.subject();
  Ember.run(function() {
    model.get('entries').createRecord({
      startedAt: new Date('2015-01-02T11:00:00Z'),
      finishedAt: new Date('2015-01-02T12:23:00Z')
    });
    model.get('entries').createRecord({
      startedAt: new Date('2015-01-01T09:00:00Z'),
      finishedAt: new Date('2015-01-01T12:00:00Z')
    });
  });
  equal(model.get('duration'), '4:23:00');
});
