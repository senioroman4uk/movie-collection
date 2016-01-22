/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var crypto = require('crypto');

module.exports = {
  new: function (req, res) {
    //if already logged in redirect to home page
    if (!!req.session.user !== false)
      return req.param('ajax') ? res.redirect('/?ajax=true') : res.redirect('/');

    if (req.param('ajax')) {
      sails.hooks.views.render('user/new', {layout: null, flash: res.locals.flash}, function (error, html) {
        if (error)
          return res.serverError(error);
        return res.json(200, {title: utilService.makeTitle('sign up'), html: html});
      });
    }
    else
      return res.view({
        title: 'login'
      });
    //return res.view({page: 'sign up'})
  },

  create: function (req, res) {
    var allowedParameters = ['name', 'email', 'password', 'repeatPassword'];
    var data = {};

    for (var i = 0; i < allowedParameters.length; i++) {
      data[allowedParameters[i]] = req.param(allowedParameters[i], '');
      data[allowedParameters[i]] = data[allowedParameters[i]].trim();
      if (!!data[allowedParameters[i]] === false) {
        req.session.flash.danger.push("You have to fill in all the fields");
        if (!req.wantsJSON)
          return res.redirect('/signup');
        else {
          return res.json(400, {errors: ['You have to fill in all the fields']})
        }
      }
    }
    if (data['password'] !== data['repeatPassword']) {
      req.session.flash.danger.push("Passwords do not match");
      if (!req.wantsJSON)
        return res.redirect('/signup');
      else {
        return res.json(400, {errors: ['Passwords do not match']})
      }
    }
    delete data['repeatPassword'];

    data['salt'] = crypto.randomBytes(128).toString('hex');
    data['password'] = crypto.pbkdf2Sync(data['password'], data['salt'], 4096, 128, 'sha512').toString('hex');
    // normal user
    data['access'] = 1;

    User.create(data, function (error, user) {
      if (error) {
        try {
          var errors = [];
          for (var name in error.Errors) {
            if (error.Errors.hasOwnProperty(name)) {
              errors.push(error.Errors[name][0].message);
            }
          }
          if (!req.wantsJSON) {
            req.session.flash.danger = req.session.flash.danger.concat(errors);
            return res.redirect('/signup');
          }
          else
            return res.json(400, {errors: errors});
        }
        catch (e) {
          if (!req.wantsJSON) {
            req.session.flash.danger.push('Registration Failed');
            return res.redirect('/signup');
          }
          else
            return res.json(400, {errors: ['Registration Failed']});
        }
      }
      else {
        sessionService.logIn(req, res, user, function (req, res) {
          req.session.flash.success.push("You have registered");
          if (req.wantsJSON)
            return res.redirect('/?ajax=true');
          else
            return res.redirect('/');
        });
      }
    });
  },

  find: function (req, res) {
    var limit = Math.min(req.param('limit', 10), 20);
    var page = req.param('page', 1);

    var jobs = [
      function (next) {
        User.find().paginate({page: page, limit: limit}).exec(next);
      },

      function (next) {
        User.count().exec(next);
      }
    ];

    async.parallel(jobs, queryHandlerService.find(req, res, limit, page, {}, 'user', 'users', []));


    User.find({}).paginate(page, limit).exec(function (err, users) {

    });
  },

  findOneByName: function (req, res) {
    User.findOne({name: req.param('name')}, queryHandlerService.findOne(req, res, 'user'));
  },

  edit: function (req, res) {
    var id = req.param('id');

    User.findOne(id).exec(function (err, user) {
      if (err)
        return res.negotiate(err);

      return res.view({user: user});
    });
  },

  update: actionService.updateAction('user', [], true)
};
