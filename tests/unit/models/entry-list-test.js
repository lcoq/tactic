import {
  moduleForModel,
  test
} from 'ember-qunit';
import Ember from 'ember';

moduleForModel('entry-list', 'EntryList', {
  // Specify the other units that are required for this test.
  needs: [ 'model:Entry' ]
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
