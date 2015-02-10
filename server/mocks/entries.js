module.exports = function(app) {
  var express = require('express');
  var entriesRouter = express.Router();

  entriesRouter.get('/', function(req, res) {
    res.send({
      'entries': []
    });
  });

  entriesRouter.post('/', function(req, res) {
    res.status(201).send({
      'entry': {
        id: 5,
        title: 'Time entry creation',
        startedAt: new Date('2015-02-10T09:14:23Z'),
        finishedAt: new Date('2015-02-10T13:27:18Z'),
        project: 1
      },
      'project': {
        id: 3,
        name: 'Tactic'
      }
    });
  });

  entriesRouter.get('/:id', function(req, res) {
    res.send({
      'entries': {
        id: req.params.id
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
