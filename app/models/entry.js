import DS from 'ember-data';

var Entry = DS.Model.extend({
  title: DS.attr('string')
});

Entry.reopenClass({
  FIXTURES: [
    {
      id: 1,
      title: 'SEO: Staging deploy'
    }, {
      id: 2,
      title: 'International shipping: Zip code optional'
    }, {
      id: 3,
      title: 'International shipping: Staging deploy'
    }
  ]
});

export default Entry;
