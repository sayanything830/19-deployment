'use strict';

const Auth = require('../model/auth.js');
const bodyParser = require('body-parser').json(); // check this
const errorHandler = require('../lib/error-handler.js');
const basicAuth = require('../lib/basic-auth-middleware.js');

module.exports = function(router) {
  router.post('/signup', bodyParser, (req, res) => {
    let pw = req.body.password;
    delete req.body.password;

    let user = new Auth(req.body);

    user.generatePasswordHash(pw) 
      .then(newUser => newUser.save())
      .then(userRes => userRes.generateToken())
      .then(token => res.status(201).json(token))
      .catch(err => errorHandler(err, res));
  });

  router.get('/signin', basicAuth, (req, res) => {
    Auth.findOne({username: req.auth.username})
      .then(user => {
        return user 
          ? user.comparePasswordHash(req.auth.password) 
          : Promise.reject(new Error('Authorization failed, user not found.'));
      })
      .then(user => {
        delete req.headers.authorization;
        delete req.auth.password;
        return user;
      })
      .then(user => user.generateToken())
      .then(token => res.status(200).json(token))
      .catch(err => errorHandler(err, res));
  });
};