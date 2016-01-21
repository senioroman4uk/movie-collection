/**
 * Created by Vladyslav on 20.01.2016.
 */

module.exports = {
  autoUpdatedAt: false,
  autoCreatedAt: false,

  attributes: {
    ancestor: {
      model: 'Comment'
    },

    descendant: {
      model: 'Comment'
    },

    level: {
      type: 'integer'
    }
  }
};
