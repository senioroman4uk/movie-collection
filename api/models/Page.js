/**
 * Created by Vladyslav on 04.10.2015.
 */

module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true
    },

    title: {
      type: 'string',
      required: false
    },

    order: {
      type: 'integer',
      required: true,
      unique: true
    },

    showInMenu: {
      type: 'integer',
      defaultsTo: 1
    },

    link: {
      type: 'string',
      required: true,
      unique: true
    },

    route: {
      type: 'string',
      required: true
    }
  }
};
