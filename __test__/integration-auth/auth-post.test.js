'use strict';

const server = require('../../lib/server.js');
const superagent = require('superagent');
const Auth = require('../../model/auth.js');
const faker = require('faker');
require('jest');

describe('POST', function() {
  beforeAll(server.start);
  afterAll(server.stop);
  afterAll(() => Promise.all([Auth.remove()]));
 
  describe('Valid req/res', () => {
    beforeAll(() => {
      return superagent.post(':4000/api/v1/signup')
        .send(new Auth({
          username: faker.name.firstName(),
          password: faker.internet.password(),
          email: faker.internet.email(),
        }))
        .then(res => this.response = res);
    });
    it('should respond with a status of 201', () => {
      expect(this.response.status).toBe(201);
    });
    it('should post a new user with a username, email, and password', () => {
      console.log(this.response.request._data);
      expect(this.response.request._data).toHaveProperty('username');
      expect(this.response.request._data).toHaveProperty('email');
      expect(this.response.request._data).toHaveProperty('password');
    });
  
  });
  describe('Invalid req/res', () => {
    this.auth = {
      username: faker.name.firstName(),
      password: faker.hacker.phrase(),
      email: faker.internet.email(),
    };

    it('should return a status 404 on bad path', () => {
      return superagent.post(`:${process.env.PORT}/api/v1/doesnotexist`)
        .send(this.auth)
        .catch(err => {
          expect(err.status).toBe(404);
        });
    });
    it('should return a status 400 on a bad request', () => {
      return superagent.post(`:${process.env.PORT}/api/v1/signup`)
        .send(new Auth({username: '', email: '', password: 123}))
        .catch(err => {
          expect(err.status).toBe(400);
        });
    });
  });
});