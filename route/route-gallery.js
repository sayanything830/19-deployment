'use strict';

const Gallery = require('../model/gallery.js');
const bodyParser = require('body-parser').json();
const errorHandler = require('../lib/error-handler.js');
const bearerAuthMiddleware = require('../lib/bearer-auth-middleware.js');

const ERROR_MESSAGE = 'Authorization Failed';

module.exports = router => {
  router.route('/gallery/:_id?')
    .post(bearerAuthMiddleware, bodyParser, (request, response) => {
      // do I have a user in my request?
      // add error checking - optional
      request.body.userId = request.user._id;
      return new Gallery(request.body).save()
        .then(createdGallery => response.status(201).json(createdGallery))
        .catch(error => errorHandler(error, response));
    })

    .get(bearerAuthMiddleware, (request, response) => {
      // returns one gallery
      if(request.params._id) {
        return Gallery.findById(request.params._id)
          .then(gallery => response.status(200).json(gallery))
          .catch(error => errorHandler(error, response));
      }
      // returns all galleries
      return Gallery.find()
        .then(galleries => {
          let galleriesId = galleries.map(gallery => gallery._id);
          response.status(200).json(galleriesId);
        })
        .catch(error => errorHandler(error, response));
    })
    .put(bearerAuthMiddleware, bodyParser, (request,response) => {
      Gallery.findOne({
        userId: request.user._id,
        _id: request.params._id,
      })
        .then(gallery => {
          if(!gallery) return Promise.reject(new Error('Authorization Error.'));
          return gallery.set(request.body).save();
        })
        .then(() => response.sendStatus(204))
        .catch(error => errorHandler(error, response));
    })
    .delete(bearerAuthMiddleware,(request,response) => {
      return Gallery.findById(request.params._id)
        .then(gallery => {
          if(gallery.userId.toString() === request.user._id.toString())
            return gallery.remove();

          return errorHandler(new Error(ERROR_MESSAGE),response);
        })
        .then(() => response.sendStatus(204))
        .catch(error => errorHandler(error,response));
    });
};