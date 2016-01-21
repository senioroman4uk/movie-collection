/**
 * Created by Vladyslav on 05.01.2016.
 */

module.exports = {

  attributes: {
    ip: {
      type: 'string',
      required: true
    },

    user: {
      model: 'user'
    },

    option: {
      model: 'pollOption'
    }
  }
};
