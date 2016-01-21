/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    name : {
      type: 'string',
      size: 100,
      maxLength: 100,
      required: true,
      unique: true
    },
    email: {
      type: 'email',
      size: 255,
      unique: true,
      maxLength: 255,
      required: true
    },
    password: {
      type: 'string',
      size: 256,
      required: true
    },
    salt: {
      type: 'string',
      size: 256
    },
    access: {
      model: 'role'
    },
    token: {
      type: 'string',
      size: 256
    },

    pollResults: {
      collection: 'pollResult',
      via: 'user'
    },

    comments: {
      collection: 'comment',
      via: 'author'
    },

    'getName': function () {
      return this.name;
    },

    cover: {
      type: 'string'
    },

    about: {
      type: 'text'
    }
  },
  validationMessages: {
    name: {
      required: 'Name is required',
      maxLength: 'Too long value for name, maximum is 100'
    },
    email: {
      required: 'Email is required',
      email: 'Provide valid email address',
      maxLength: 'Too long value for email, maximum is 255',
      unique: 'Account with this email exists'
    },
    password: {
      required: 'Password is required',
      maxLength: 'Too long value for password, maximum is 255'
    }
  },

  afterUpdate: coverService.moveToAssets('users'),

  afterCreate: coverService.moveToAssets('users'),

  afterDestroy: function (records, cb) {
    async.each(records, function (record, callback) {
      coverService.completeDeleteCover(record, 'users', callback);
    }, cb);
  }
};

