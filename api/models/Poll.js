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
      defaultsTo: 1
    },

    options: {
      collection: 'pollOption',
      via: 'poll'
    },

    getName: function() {
      return this.summary;
    },

    count: function(){
      var total = 0;

      this.options.forEach(function(option) {
        total += option.amount;
      });

      sails.log.debug(this.options);

      return total;
    }
  }
};

