'use strict';

const faker = require('faker');
const mock = require('../lib/mock.js');
const superagent = require('superagent');
const server = require('../../lib/server.js');
require('jest');

describe('POST /api/v1/gallery', function() {
  beforeAll(server.start);
  afterAll(server.stop);
  afterAll(mock.auth.removeAll);
  afterAll(mock.gallery.removeAll);

  beforeAll(() => mock.auth.createOne().then(data => this.mockUser = data));
  // console.log(this.mockUser);
  describe('Valid request', () => {
    
    beforeAll(() => {
      return superagent.post(`:${process.env.PORT}/api/v1/gallery`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .send({
          name: faker.lorem.word(),
          description: faker.lorem.words(4),
        })
        .then(res => this.res = res);
    });

    it('should return a 201 CREATED status code', () => {
      expect(this.res.status).toEqual(201);
    });
    it('should return a valid gallery as the body of data', () => {
      expect(this.res.body).toHaveProperty('name');
      expect(this.res.body).toHaveProperty('description');
      expect(this.res.body).toHaveProperty('_id');
    });
    it('should return a userId that matches the mock user', () => {
      expect(this.res.body.userId).toEqual(this.mockUser.user._id.toString());
    });
  });

  describe('Invalid request', () => {
    it('should return a 401 NOT AUTHORIZED given back token', () => {
      return superagent.post(`:${process.env.PORT}/api/v1/gallery`)
        .set('Authorization', 'Bearer BADTOKEN')
        .catch(err => expect(err.status).toEqual(401));
    });
    it('should return a 400 BAD REQUEST on improperly formatted body', () => {
      return superagent.post(`:${process.env.PORT}/api/v1/gallery`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .send({})
        .catch(err => expect(err.status).toEqual(400));
    });
  });
});