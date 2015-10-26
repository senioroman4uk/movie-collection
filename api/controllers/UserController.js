/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var crypto = require('crypto');

module.exports = {
  new: function(req, res) {
    //if already logged in redirect to home page
    if (!!req.session.user !== false)
      return res.redirect('/');
    return res.view({page: 'sign up'})
  },

  create: function (req, res) {
    var allowedParameters = ['name', 'email', 'password', 'repeatPassword'];
    var data = {};

    for (var i = 0; i < allowedParameters.length; i++) {
      data[allowedParameters[i]] = req.param(allowedParameters[i], '');
      data[allowedParameters[i]] = data[allowedParameters[i]].trim();
      if (!!data[allowedParameters[i]] === false) {
        req.session.flash.danger.push("You have to fill in all the fields");
        return res.redirect('/signup');
      }
    }
    if (data['password'] !== data['repeatPassword']) {
      req.session.flash.danger.push("Passwords do not match");
      return res.redirect('/signup');
    }
    delete data['repeatPassword'];

    data['salt'] = crypto.randomBytes(128).toString('hex');
    data['password'] = crypto.pbkdf2Sync(data['password'], data['salt'], 4096, 128, 'sha512').toString('hex');
    // normal user
    data['role'] = 1;

    User.create(data, function(error, user) {
      if (error) {
        if (typeof(error.Errors) !== 'undefined') {
          for (var name in error.Errors) {
            req.session.flash.danger.push(error.Errors[name][0].message);
          }
          return res.redirect('/signup');
        }
        else {
          req.session.flash.danger.push('Registration Failed');
          res.redirect('/signup')
        }
      }
      else {
          sessionService.logIn(req, res, user, function(req, res) {
          req.session.flash.success.push("You have registered");
          return res.redirect('/');
        });
      }
    });
  }
};

