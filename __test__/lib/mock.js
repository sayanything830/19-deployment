'use strict';

const faker = require('faker');
const Auth = require('../../model/auth.js');
const Gallery = require('../../model/gallery.js');
// const Photo = require('../../model/photo.js');


const mock = module.exports = {};

// Auth Mocks - One, RemoveAll
mock.auth = {};

mock.auth.createOne = () => {
  let result = {};
  result.password = faker.internet.password();

  return new Auth({
    username: faker.internet.userName(),
    email: faker.internet.email(),
  })
    .generatePasswordHash(result.password)
    .then(user => result.user = user)
    .then(user => user.generateToken())
    .then(token => result.token = token)
    .then(() => {
      return result;
    });
};

mock.auth.removeAll = () => Promise.all([Auth.remove()]);

mock.gallery = {};
mock.gallery.createOne = () => {
  let resultMock = null;

  return mock.auth.createOne()
    .then(createdUserMock => resultMock = createdUserMock)
    .then(createdUserMock => {
      return new Gallery({
        name: faker.internet.domainWord(),
        description: faker.random.words(15),
        userId: createdUserMock.user._id,
      }).save(); // saved to Mongo
    })
    .then(gallery => {
      resultMock.gallery = gallery;
      return resultMock;
    });
};


mock.gallery.removeAll = () => Promise.all([Gallery.remove()]);

// ----------------------------------------------------------
//         *** Attempt to make a mock photo ***
//-----------------------------------------------------------
// mock.photo = {};

// mock.photo.createOne = function() {
//   return mock.auth.createOne()
//     .then(userMock => this.result = userMock)
//     .then(userMock => {
//       new Gallery({
//         name: faker.internet.domainWord(),
//         description: faker.random.words(15),
//         userId: userMock.user._id,
//       })
//         .then(gallery => this.result.gallery = gallery)
//         // .then(console.log)
//         .then(data => {
//           new Photo({
//             image: `${__dirname}/../lib/beard.jpg`,
//             name: faker.hacker.noun(),
//             description: faker.hacker.phrase(),
//             userId: this.result._id,
//             galleryId: this.result.gallery._id,
//           }).save()
//             .then(console.log)
//             .then(photo => {
//               this.result.photo = photo;
//               return this.result;
//             });
//         });
//     });

// };

// mock.photo.removeAll = () => Promise.all([Photo.remove()]);