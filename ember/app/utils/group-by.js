import Ember from 'ember';

var get = Ember.get, arrayComputed = Ember.arrayComputed;

export default function (dependentKey, property, groupClass) {
  var options = {
    initialValue: [],

    addedItem: function(array, item) {
      var key = get(item, property),
      group = array.findBy('key', key);
      if (!group) {
        group = groupClass.create({
          content: [],
          key: key
        });
        var index = array.indexOf(array.find(function(otherGroup) { return otherGroup.isBefore(group); }));
        if (index === -1) {
          array.pushObject(group);
        } else {
          array.insertAt(index, group);
        }
      }

      group.pushObject(item);

      return array;
    },

    removedItem: function(array, item) {
      var group = array.find(function(g) { return g.contains(item); });
      if (!group) {
        return;
      }

      group.removeObject(item);

      if (get(group, 'length') === 0) {
        array.removeObject(group);
      }
      return array;
    }

  };
  return arrayComputed(dependentKey, options);
}
