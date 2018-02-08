'use strict';

const mock = require('../lib/mock.js');
const superagent = require('superagent');
const server = require('../../lib/server.js');
require('jest');

describe('GET api/v1/gallery', function() {
  beforeAll(server.start);
  afterAll(server.stop);
  afterAll(mock.auth.removeAll);
  afterAll(mock.gallery.removeAll);

  beforeAll(() => mock.auth.createOne().then(data => this.mockUser = data));
  beforeAll(() => mock.gallery.createOne().then(data => this.mockGallery = data));
  // console.log(this.mockGallery);

  describe('Valid request', () => {
    it('should return a status 200 for all user galleries', () => {
      return superagent.get(`:${process.env.PORT}/api/v1/gallery`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .then(res => {
          expect(res.status).toEqual(200);
        }); 
    });
    it('should return a status 200 for a gallery with an id', () => {
      return superagent.get(`:${process.env.PORT}/api/v1/gallery/${this.mockGallery.gallery._id}`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .then(res => {
          // console.log(this.mockGallery);
          expect(res.status).toEqual(200);
        });
    });
  });
  describe('Invalid request', () => {
    it('should return a 401 NOT AUTHORIZED with a bad token', () => {
      return superagent.get(`:${process.env.PORT}/api/v1/gallery`)
        .set('Authorization', 'Bearer BADTOKEN')
        .catch(err => expect(err.status).toEqual(401));
    });
    it('should return a 404 status for not found', () => {
      return superagent.get(`:${process.env.PORT}/api/v1/galle`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .send({})
        .catch(err => expect(err.status).toEqual(404));
    });
  });
});
