/**
 * Created by Vladyslav on 10.10.2015.
 */


var async = require('async');

//Wraping controller action's that return a view
function getPagesDecorator(action) {
  return function () {
    //saving original action scope and parameters
    var that = this;
    var parameters = arguments;

    //jobs for processing by async library
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
      next(null);
    });

    async.waterfall(jobs, function (err) {
      if (err) {
        console.error(err);
        return parameters[1].serverError();
      }
      action.apply(that, parameters)
    });
  }
}

module.exports = {getPagesDecorator: getPagesDecorator};
