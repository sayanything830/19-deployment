'use strict';

const errorHandler = require('./error-handler.js');

module.exports = function(req, res, next) {
  let authHeaders = req.headers.authorization;
  if(!authHeaders) {
    return errorHandler(new Error('Auth failes, headers do not match requirement'), res);
  }
  let base64 = authHeaders.split('Basic ')[1];
  if(!base64) {
    return errorHandler(new Error('Auth failed, username and password required.'), res);
  }
  let [username, password] = Buffer.from(base64, 'base64').toString().split(':');
  req.auth = {username, password};
  if(!req.auth.username) {
    return errorHandler(new Error('Auth failed, username required'), res);
  }
  if(!req.auth.password) {
    return errorHandler(new Error('Auth failed, password required'), res);
  }
  next();
};