/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */
var fixtures = require('sails-fixtures');
var assync = require('async');
var moment = require('moment');

module.exports.bootstrap = function(cb) {

  var jobs = [];
  //jobs.push(processFixtures);
  jobs.push(getPages);
  jobs.push(addMoment);

  assync.series(jobs, cb);
  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)

  function processFixtures(next){
    fixtures.init({
      'dir': 'api/fixtures',
      'pattern': '*.json' // Default is '*.json'
    }, next);
  }

  function getPages(next){
    sails.models['page'].find().sort('order').exec(function (err, pages) {
      if (err)
        next(err);

      sails.config.pages = pages;
      for (var i = 0; i < pages.length; i++)
      {
        var routes = pages[i].route.split(': ');
        if (routes.length !== 2)
          continue;
        sails.config.routes[routes[0]] = routes[1];
      }
      //reloading router
      sails.router.flush();
      sails.hooks.blueprints.bindShadowRoutes();
      next(null);
    });
  }

  function addMoment(next) {
    sails.moment = moment;
    next(null);
  }
};
