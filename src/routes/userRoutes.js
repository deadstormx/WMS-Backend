const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');

module.exports = (db) => {
  router.post('/register', (req, res) => registerUser(req, res, db));
  router.post('/login', (req, res) => loginUser(req, res, db));
  return router;
};
