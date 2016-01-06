  /**
  * Actor.js
  *
  * @description :: TODO: You might write a short summary of how this model works and what it represents here.
  * @docs        :: http://sailsjs.org/#!documentation/models
  */

  var async = require('async');
  var fs = require('fs');
  var path = require('path');

  module.exports = {

    attributes: {
      link: {
        type: 'string',
        required: true,
        unique: true
      },

      firstName: {
        type: 'string',
        required: true
      },

      lastName: {
        type: 'string',
        required: true
      },

      middleName: {
        type: 'string',
        defaultsTo: ''
      },

      birthDate: {
        type: 'date',
        required: true
      },

      generalInfo: {
        type: 'text',
        required: true,
        maxLength: 660
      },

      biography: {
        type: 'text',
        required: false,
        defaultsTo: ''
      },

      birthPlace: {
        type: 'string',
        required: false,
        defaultsTo: ''
      },

      birthName: {
        type: 'string',
        required: false,
        defaultsTo: ''
      },

      cover: {
        type: 'string',
        required: true
      },

      'movies': {
        collection: 'movie',
        via: 'actors'
      },

      'getName': function() {
        return this.firstName + ' ' + this.lastName;
      },

      'rating': function() {
        var sum = 0.0;
        console.log(this.movies);
        if (typeof (this.movies) === 'undefined' || this.movies.length === 0)
          return sum;


        for (var i = 0; i < this.movies.length; i++)
          sum += this.movies[i].rating;
        return sum / this.movies.length * 10;
      }
    },

    beforeValidate: function (values, cb) {
      if (!!values['link'] === false)
        values['link'] = [values.firstName, values.middleName, values.lastName].join('-').toLowerCase();
      cb();
    },

    afterUpdate: coverService.moveToAssets('actors'),

    afterCreate: coverService.moveToAssets('actors'),

    afterDestroy: function (records, cb) {
      async.each(records, function (record, callback) {
        coverService.completeDeleteCover(record, 'actors', callback);
      }, cb);
    }
  };
