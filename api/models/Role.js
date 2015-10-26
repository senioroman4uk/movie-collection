/**
 * Created by Vladyslav on 17.10.2015.
 */

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true
    },

    users: {
      collection: 'user',
      via: 'access'
    },
    pages: {
      collection: 'page',
      via: 'access'
    }
  }
};
