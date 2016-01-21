/**
 * Created by Vladyslav on 20.01.2016.
 */

module.exports = {
  attributes: {
    author: {
      model: 'user'
    },

    ip: {
      type: 'text'
    },

    text: {
      type: 'text',
      required: true
    },

    ancestors: {
      collection: 'CommentsTreePath',
      via: 'ancestor'
    },

    descendants: {
      collection: 'CommentsTreePath',
      via: 'descendant'
    },

    articleType: {
      type: 'string',
      required: true
    },

    articleId: {
      type: 'integer',
      required: true
    },

    level: {
      type: 'integer'
    }
  }
};
