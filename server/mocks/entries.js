module.exports = function(app) {
  var express = require('express');
  var entriesRouter = express.Router();

  entriesRouter.get('/', function(req, res) {
    res.send({
      'entries': [
        {
          id: 4,
          title: 'International Shipping: Staging deploy',
          startedAt: '2015-02-11T11:23:00Z',
          finishedAt: '2015-02-11T12:59:00Z',
          project: 2
        }, {
          id: 3,
          title: 'International Shipping: Optional zip code',
          startedAt: '2015-02-09T10:01:00Z',
          finishedAt: '2015-02-09T10:47:00Z',
          project: 2
        }, {
          id: 2,
          title: 'International Shipping: Optional state',
          startedAt: '2015-02-08T15:43:00Z',
          finishedAt: '2015-02-08T17:37:00Z',
          project: 2
        }, {
          id: 1,
          title: 'Generic import',
          startedAt: '2015-01-01T09:03:00Z',
          finishedAt: '2015-01-01T12:18:00Z',
          project: 1
        }
      ],
      'projects': [
        {
          id: 1,
          name: 'Heroshop'
        }, {
          id: 2,
          name: 'Vitarock'
        }
      ]
    });
  });

  entriesRouter.post('/', function(req, res) {
    res.status(201).send({
      'entry': {
        id: Math.floor(Math.random() * 1000000)
      }
    });
  });

  entriesRouter.put('/:id', function(req, res) {
    res.send({
      'entries': {
        id: req.params.id
      }
    });
  });

  entriesRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/entries', entriesRouter);
};
