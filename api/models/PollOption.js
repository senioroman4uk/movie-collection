/**
 * Created by Vladyslav on 05.01.2016.
 */

module.exports = {

  attributes: {
    text: {
      type: 'string',
      required: true
    },

    poll: {
      model: 'poll'
    },

    results: {
      collection: 'pollResult',
      via: 'option'
    },

    amount: {
      type: 'integer',
      defaultsTo: 0
    }
  }
};
