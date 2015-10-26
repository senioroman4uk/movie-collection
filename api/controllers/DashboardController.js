/**
 * Created by Vladyslav on 18.10.2015.
 */

var async = require('async');
var asyncComplete = function (req, res) {
  return function (err, data) {
    if (err)
      return res.serverError();
    else
      return res.json({rows: data[0], total: data[1]})
  }
};
var getParameters = function (req) {
  var limit = Math.min(req.param('limit', 10), 20),
    skip = req.param('offset', 0),
    sort = req.param('sort', ''),
    order = req.param('order', '');

  var params = {skip: skip, limit: limit};
  if (order !== '' && sort !== '')
    params.sort = sort + ' ' + order;

  return params;
};

//TODO: Refactor
//HINT JOBS CREATION FUNCTION
module.exports = {
  index: function (req, res) {
    return res.view({layout: '/layouts/dashboardLayout'});
  },

  getGenres: function (req, res) {
    if (!req.xhr || !req.wantsJSON)
      return res.view({layout: '/layouts/dashboardLayout'});

    var params = getParameters(req);
    var jobs = [
      function (next) {
        Genre.find(params, next);
      },
      function (next) {
        Genre.count(next);
      }
    ];

    async.parallel(jobs, asyncComplete(req, res));
  },

  getMovies: function (req, res) {
    if (!req.xhr || !req.wantsJSON) {
      Genre.find().exec(function (err, data) {
        if (err)
          return res.serverError();
        return res.view({layout: '/layouts/dashboardLayout', genres: data});
      });
    }
    else {
      var params = getParameters(req);
      var jobs = [
        function (next) {
          Movie.find(params).populateAll().exec(next);
        },
        function (next) {
          Movie.count(next);
        }
      ];

      async.parallel(jobs, asyncComplete(req, res));
    }
  },

  getPages: function (req, res) {
    if (!req.xhr || !req.wantsJSON) {
      Role.find(function (err, roles) {
        if (err)
          return res.serverError();
        return res.view({layout: '/layouts/dashboardLayout', roles: roles});
      });
    }
    else {
      var params = getParameters(req);
      var jobs = [
        function (next) {
          Page.find(params).populateAll().exec(next)
        },
        function (next) {
          Page.count(next);
        }
      ];

      async.parallel(jobs, asyncComplete(req, res));
    }
  },

  getActors: function (req, res) {
    if (!req.xhr || !req.wantsJSON) {
      return res.view({layout: '/layouts/dashboardLayout'});
    }
    else {
      var params = getParameters(req);
      var jobs = [
        function (next) {
          Actor.find(params).populateAll().exec(next);
        },
        function (next) {
          Actor.count(next);
        }
      ];

      async.parallel(jobs, asyncComplete(req, res));
    }
  },

  getRoles: function (req, res) {
    Role.find({}, function (err, data) {
      if (err)
        return res.serverError();
      var roles = [];
      data.forEach(function (role) {
        roles.push({value: role.id, text: role.name})
      });
      return res.json(roles);
    })
  },

  getMessages: function (req,  res) {
    console.log('here');
    if (!req.xhr || !req.wantsJSON) {
      return res.view({layout: '/layouts/dashboardLayout'});
    }
    else {
      var params = getParameters(req);
      var jobs = [
        function (next) {
          Contact.find(params).populateAll().exec(next);
        },
        function (next) {
          Contact.count(next);
        }
      ];

      async.parallel(jobs, asyncComplete(req, res));
    }
  },

  selectActors: function (req, res) {
    var options = {};
    var parts = req.param('q', '');

    if (parts != '') {
      parts = parts.split(' ');
      options['or'] = [{firstName: {contains: parts[0]}}];
      if (parts.length > 1)
        options['or'].push({lastName: {contains: parts[1]}});
    }


    Actor.find(options, {select: ['id', 'firstName', 'lastName']}).exec(function (err, actors) {
      if (err)
        return res.serverError();
      actors.forEach(function (actor, i) {
        actors[i] = {id: actor.id, text: actor.getName()}
      });
      return res.json({results: actors});
    })
  },

  selectMovies: function (req, res) {
    var options = {};
    var token = req.param('q', '');
    if (token != '') {
      options['name'] = {contains: token}
    }

    Movie.find(options, {select: ['id', 'name']}).exec(function (err, movies) {
      if (err)
        return res.serverError();
      movies.forEach(function (movie, i) {
        movies[i] = {id: movie.id, text: movie.name}
      });
      return res.json({results: movies});
    })
  }
};
