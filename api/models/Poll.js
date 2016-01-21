/**
 * Votes.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    summary: {
      type: 'string',
      required: true,
      maxLength: 255
    },

    active: {
      type: 'integer',
      defaultsTo: 0
    },

    options: {
      collection: 'pollOption',
      via: 'poll'
    }
  }
};

