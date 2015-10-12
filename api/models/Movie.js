/**
* Movie.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true
    },

    year: {
      type: 'integer',
      required: true
    },

    description: {
      type: 'text',
      required: true,
      maxLength: 660
    },

    length: {
      type: 'integer',
      required: true
    },

    cover: {
      type: 'string',
      defaultsTo: ''
    },

    rating: {
      type: 'float',
      defaultsTo: 0.0
    },

    actors: {
      collection: 'actor',
      via: 'movies'
    },

    genres: {
      collection: 'genre',
      via: 'movies'
    },

    storyLine: {
      type: 'text',
      defaultsTo: ''
    }
  }
};

