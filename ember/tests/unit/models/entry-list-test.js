import {
  moduleForModel,
  test
} from 'ember-qunit';
import Ember from 'ember';
import EntryList from 'tactic/models/entry-list';

function subject() {
  return EntryList.create({
    content: [
      Ember.Object.create({
        startedAt: new Date('2015-02-11T09:22:33Z'),
        finishedAt: new Date('2015-02-11T12:37:29Z')
      }),
      Ember.Object.create({
        startedAt: new Date('2015-01-10T08:00:00Z'),
        finishedAt: new Date('2015-01-10T12:00:00Z')
      })
    ],
    key: '2015-02-11'
  });
}

module('EntryList');

test('it exists', function() {
  var model = subject();
  ok(!!model);
});

test('is is today', function() {
  var model = subject(), now = new Date();
  Ember.run(function() {
    model.set('content', [ Ember.Object.create({ startedAt: now }) ]);
  });
  ok(model.get('isToday'));
});

test('it is not today', function() {
  var model = subject();
  ok(!model.get('isToday'));
});

test('is in current week', function() {
  var model = subject(), now = new Date();
  Ember.run(function() {
    model.set('content', [ Ember.Object.create({ startedAt: now }) ]);
  });
  ok(model.get('inCurrentWeek'));
});

test('it is not in current week', function() {
  var model = subject();
  ok(!model.get('inCurrentWeek'));
});

test('it duration is the sum of its entries durations', function() {
  var model = subject();
  equal(model.get('duration'), '7:14:56');
});
