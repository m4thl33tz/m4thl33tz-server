const { Router } = require('express');
const Points = require('../models/Points');

module.exports = Router()
  .post('/newPoints', (req, res, next) => {
    Points.createPoints(req.body)
      .then((points) => res.send(points))
      .catch(next);
  })
  .get('/getAll', (req, res, next) => {
    Points.findAllPoints()
      .then((points) => res.send(points))
      .catch(next);
  })
  .put('/addPoints', (req, res, next) => {
    Points.addPoints(req.body)
      .then((points) => res.send(points))
      .catch(next);
  })

  .get('/getPlayerPoints/:id', (req, res, next) => {
    Points.findPointsByUniqueId(req.params.id)
      .then((points) => res.send(points))
      .catch(next);
  });
