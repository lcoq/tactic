module.exports = function(app) {
  var express = require('express');
  var projectsRouter = express.Router();

  projectsRouter.get('/', function(req, res) {
    res.send({
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

  projectsRouter.post('/', function(req, res) {
    res.status(201).end();
  });

  app.use('/api/projects', projectsRouter);
};
