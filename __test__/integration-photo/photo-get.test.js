'use strict';

const faker = require('faker');
const mock = require('../lib/mock.js');
const superagent = require('superagent');
const server = require('../../lib/server.js');
const image = `${__dirname}/../lib/beard.jpg`;
const Photo = require('../../model/photo.js');
require('jest');

describe('GET api/v1/photo', function() {
  beforeAll(server.start);
  beforeAll(() => mock.auth.createOne().then(data => this.mockUser = data));
  afterAll(server.stop);
  afterAll(mock.auth.removeAll);
  afterAll(mock.gallery.removeAll);
  afterAll(() => Promise.all([Photo.remove()]));

  beforeAll(() => {
    let galleryMock =  null;
    return mock.gallery.createOne()
      .then(mock => {
        galleryMock = mock;
        return superagent.post(`:${process.env.PORT}/api/v1/photo`)
          .set('Authorization', `Bearer ${mock.token}`)
          .field('name', faker.hacker.noun())
          .field('description', faker.hacker.phrase())
          .field('galleryId', `${galleryMock.gallery._id}`)
          .attach('image', image);
      })
      .then(res => this.res = res);
  });

  describe('Valid request', () => {
    it('should return a 200 status and an object when getting a photo by id', () => {
      return superagent.get(`:${process.env.PORT}/api/v1/photo/${this.res.body._id}`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body).toHaveProperty('name');
          expect(response.body).toHaveProperty('description');
        });
    });
    it('should return status 200 and an array of photos when getting all', () => {
      return superagent.get(`:${process.env.PORT}/api/v1/photo`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .then(response => {
          expect(response.status).toEqual(200);
          expect(Array.isArray(response.body)).toBe(true);
        });
    });
  });
  // describe('mock', () => {
  //   it('should return something', () => {
  //     return mock.photo.createOne()
  //       .then(console.log);
  //   });
  // });
  describe('Invalid request', () => {
    it('should return a 401 NOT AUTHORIZED given bad token', () => {
      return superagent.get(`:${process.env.PORT}/api/v1/photo`)
        .set('Authorization', 'Bearer BADTOKEN')
        .catch(err => expect(err.status).toEqual(401));
    });
    it('should return a 404 BAD REQUEST on improperly formatted body', () => {
      return superagent.get(`:${process.env.PORT}/api/v1/photo/pho`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .catch(err => expect(err.status).toEqual(404));
    });
  });
});