'use strict';

const server = require('../../lib/server.js');
const superagent = require('superagent');
const mock = require('../lib/mock.js');
require('jest');

describe('GET', function() {
  beforeAll(server.start);
  afterAll(server.stop);
  afterAll(mock.auth.removeAll);


  describe('Valid req/res', () => {
    beforeAll(() => {
      return mock.auth.createOne()
        .then(data => {
          this.authData = data;
          return superagent.get(`:${process.env.PORT}/api/v1/signin`)
            .auth(this.authData.user.username, data.password)
            .then(res => this.response = res);
        });
    });
    it('should return a status of 200', () => {
      expect(this.response.status).toBe(200);
    });
    it('should return a token', () => {
      expect(this.authData).toHaveProperty('token');
    });
  });
  describe('Invalid req/res', () => {
    it('should return a status 400 given no request body', () => {
      return superagent.post(`:${process.env.PORT}/api/v1/signup`)
        .send({
          username: 'me',
          password: 'password',
          email: 'hi',
        })
        .then((res) => {
          this.response = res;
          return superagent.get(`:${process.env.PORT}/api/v1/signin`)
            .auth('me', 'notmypassword')
            .catch(err => {
              this.errRes = err;
              expect(this.errRes.status).toEqual(401);
            });
        });
    });
    it('should return a status 404 on an invalid path', () => {
      return superagent.get(`:${process.env.PORT}/api/v1/note`)
        .catch(err => expect(err.status).toEqual(404));
    });
  });
});