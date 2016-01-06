/**
 * Movie.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var async = require('async');

module.exports = {

  attributes: {
    link: {
      type: 'string',
      required: true,
      unique: true
    },

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
      required: true
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
    },

    'getName': function () {
      return this.name;
    }
  },

  validationMessages: {
    name: {
      required: 'Name is required',
      maxLength: 'Too long value, maximum is 255'
    },

    year: {
      required: 'Year is required',
      integer: 'Year mast be an integer'
    },

    description: {
      required: 'Description is required',
      maxLength: 'Max length for this field is 660 symbols'
    },

    length: {
      required: 'Length is required',
      integer: 'Length mast be an integer'
    },
    rating: {
      float: 'Rating must be a float'
    }
  },

  beforeValidate: function (values, cb) {
    if (!!values['link'] === false)
      values['link'] = [values.name, values.year].join('-').toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "-");
    cb();
  },

  afterCreate: coverService.moveToAssets('movies'),

  afterUpdate: coverService.moveToAssets('movies'),


  afterDestroy: function (records, cb) {
    async.each(records, function (record, callback) {
      utilService.coverService(record, 'movies', callback);
    }, cb);
  }
};

