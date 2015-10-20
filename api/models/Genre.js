/**
* Genre.js
*
* @description :: Movie Genre
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  autoUpdatedAt: false,
  autoCreatedAt: false,

  attributes: {
    name: {
      type: 'string',
      required: true,
      size: 255,
      maxLength: 255
    },

    movies: {
      collection: 'movie',
      via: 'genres'
    }
  }
};

