/**
 * Created by Vladyslav on 21.10.2015.
 */

var async = require('async');
var crypto = require('crypto');

module.exports = function(req, res, next) {
  var jobs = [];

  jobs.push(function (next) {
    sails.models['page'].find().sort('order').exec(next);
  });
  jobs.push(function(pages, next) {
    sails.config.pages = pages;
    for (var i = 0; i < pages.length; i++) {
      var routes = pages[i].route.split(': ');
      if (routes.length !== 2) {
        if (routes[0] !== 'null') {
          console.error('getPagesDecorator Error, wrong route format');
        }
        continue;
      }
      sails.config.routes[routes[0]] = routes[1];
    }
    //reloading routes
    sails.router.flush();
    sails.hooks.blueprints.bindShadowRoutes();
    next(null, pages);
  });

  async.waterfall(jobs, function(err, pages) {
    if (err) {
      console.log(err);
      return res.serverError();
    }

    var _action = req.options.controller.charAt(0).toUpperCase() + req.options.controller.slice(1) + 'Controller.'
      + req.options.action;
    pages = pages.filter(function(page){
      try {
        var action = page.route.split(': ')[1];
        return action === _action;
      }
      catch (e) {
        console.log('failed to split pages route')
      }
      return false;
    });

    //page not found(some custom action)
    if (pages.length === 0)
      return next(null);

    //TODO: if one action will have different pages check the detectedVerb
    var page = pages[0];

    //page is available for everyone
    if(page.access === 0)
      return next(null);

    //not authenticated and authentication is required
    if((!!req.session.user === false) && page.access > 0) {
      req.session.flash.danger.push("You have to log in if you want to enter this page");
      return res.redirect('/login');
    }

    //
    User.findOne(req.session.user.id, function(err, user) {
      if (err) {
          console.log(err);
          return res.serverError();
      }
      //user not found
      if (!!user === false) {
        sessionService.logOut(req);
        return res.redirect('/login');
      }


      var hash = crypto.createHash('sha256');
      hash.update(user.password + req.ip);

      //if tokken is valid
      if (user.token === hash.digest('hex')){
        if(page.access > user.access) {
          req.session.flash.danger.push("You don't have enough privileges to enter this page");
          return res.redirect('/');
        }
        next(null);
      }
      else {
        sessionService.logOut(req);
        return res.redirect('/login');
      }
    })
  })
};
