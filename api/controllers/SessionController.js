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
      return req.param('ajax') ? res.redirect('/?ajax=true') : res.redirect('/');
    if (req.param('ajax')) {
      sails.hooks.views.render('session/new', {layout: null, flash: res.locals.flash}, function (error, html) {
        if (error)
          return res.serverError(error);
        return res.json(200, {title: utilService.makeTitle('login'), html: html});
      });
    }
    else
      return res.view({
        title: 'login'
      });
  },

  create: function (req, res) {
    errors = [];

    if (!req.param('email') || !req.param('password')) {
      if (!req.wantsJSON) {
        req.session.flash['danger'].push('invalid login data');
        return res.redirect('/login');
      }
      else
        return res.json(400, {errors: ['invalid login data']});
    }

    User.findOneByEmail(req.param('email'), function (error, user) {
      if (error)
        errors.push('invalid login data');
      else if (!user)
        errors.push('user with specified email/password not found');

      if (errors.length > 0) {
        if (!req.wantsJSON) {
          req.session.flash.danger = req.session.flash.danger.concat(errors);
          return res.redirect('/login');
        }
        else
          return res.json(400, {errors: errors})
      }


      var hash = crypto.pbkdf2Sync(req.param('password'), user.salt, 4096, 128, 'sha512').toString('hex');
      if (hash !== user.password) {
        if (!req.wantsJSON) {
          req.session.flash['danger'].push('user with specified email/password not found');
          return res.redirect('/login');
        }
        else
          return res.json(400, {errors: ['user with specified email/password not found']});
      }
      else {
        sessionService.logIn(req, res, user, function(req, res) {
          if (!req.wantsJSON)
            return res.redirect('/');
          else
            return res.redirect('/?ajax=true');
        });
      }
    });
  },

  destroy: function(req, res) {
    sessionService.logOut(req);
    if (!req.param('isAjax'))
      return res.redirect('/');
    else return res.redirect('/?ajax=true');
  }
};

