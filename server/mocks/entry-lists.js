module.exports = function(app) {
  var express = require('express');
  var entryListsRouter = express.Router();

  entryListsRouter.get('/', function(req, res) {
    res.send({
      'entry-lists': [
        { id: 1,
          date: '2015/02/09',
          entries: [ 3, 4 ]
        }, {
          id: 2,
          date: '2015/02/08',
          entries: [ 2 ]
        }, {
          id: 3,
          date: '2015/01/01',
          entries: [ 1 ]
        }
      ],
      'entry': [
        {
          id: 4,
          title: 'International Shipping: Staging deploy',
          startedAt: '2015-02-09T11:23:00Z',
          finishedAt: '2015-02-09T12:59:00Z'
        }, {
          id: 3,
          title: 'International Shipping: Optional zip code',
          startedAt: '2015-02-09T10:01:00Z',
          finishedAt: '2015-02-09T10:47:00Z'
        }, {
          id: 2,
          title: 'International Shipping: Optional state',
          startedAt: '2015-02-08T15:43:00Z',
          finishedAt: '2015-02-08T17:37:00Z'
        }, {
          id: 1,
          title: 'Generic import',
          startedAt: '2015-01-01T09:03:00Z',
          finishedAt: '2015-01-01T12:18:00Z'
        }
      ]
    });
  });

  entryListsRouter.post('/', function(req, res) {
    res.status(201).end();
  });

  entryListsRouter.get('/:id', function(req, res) {
    res.send({
      'entry-lists': {
        id: req.params.id
      }
    });
  });

  entryListsRouter.put('/:id', function(req, res) {
    res.send({
      'entry-lists': {
        id: req.params.id
      }
    });
  });

  entryListsRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/entry-lists', entryListsRouter);
};
