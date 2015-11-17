/**
 * SessionController
 *
 * @description :: Server-side logic for managing Sessions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var errors = [];
var crypto = require('crypto');

module.exports = {
  new: function (req, res) {
    //if already logged in redirect to home page
    if (!!req.session.user !== false)
      return res.redirect('/');

    return res.view({
      page: 'login'
    });
  },

  create: function (req, res) {
    errors = [];

    if (!req.param('email') || !req.param('password')) {
      req.session.flash['danger'].push('invalid login data');
      return res.redirect('/login');
    }

    User.findOneByEmail(req.param('email'), function (error, user) {
      if (error)
        errors.push('invalid login data');
      else if (!user)
        errors.push('user with specified email/password not found');
      if (errors.length > 0) {
        req.session.flash.danger = req.session.flash.danger.concat(errors);
        return res.redirect('/login');
      }


      var hash = crypto.pbkdf2Sync(req.param('password'), user.salt, 4096, 128, 'sha512').toString('hex');
      if (hash !== user.password) {
        req.session.flash['danger'].push('user with specified email/password not found');
        return res.redirect('/login');
      }
      else {
        sessionService.logIn(req, res, user, function(req, res) {
          return res.redirect('/');
        });
      }
    });
  },

  destroy: function(req, res) {
    sessionService.logOut(req);
    return res.redirect('/');
  }
};

