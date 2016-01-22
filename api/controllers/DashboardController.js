/**
 * Created by Vladyslav on 18.10.2015.
 */

var async = require('async');
var asyncComplete = function (req, res, model, properties) {
  return function (error, data) {
    if (error)
      return res.serverError(error);

    var vm = {rows: data[0], total: data[1]};

    if (req.wantsJSON || typeof model === 'undefined')
      return res.json(vm);
    else {
      vm['properties'] = properties;
      vm['layout'] = '/layouts/dashboardLayout';

      var limit = Math.min(req.param('limit', 10), 20);
      var page = req.param('page', 1);
      var nums = paginationService.paginate(page, limit, data[1]);
      var link = '/' + model + 's' + '?';
      vm = _.extend(vm, {_link: link, _page: page,
        _limit: limit,
        _n: nums[0],
        _i: nums[1],
        _count: nums[2]
        });

      return res.view('dashboard/get' + model + 's', vm);
    }
  }
};

/**
 *
 * @param req object user request
 * @returns {{skip: *, limit: number, order: string|undefined}} parameters for pagination
 */
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
      Genre.find().exec(function (error, data) {
        if (error)
          return res.serverError(error);
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
      Role.find(function (error, roles) {
        if (error)
          return res.serverError(error);
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
    Role.find({}, function (error, data) {
      if (error)
        return res.serverError(error);
      var roles = [];
      data.forEach(function (role) {
        roles.push({value: role.id, text: role.name})
      });
      return res.json(roles);
    })
  },

  getMessages: function (req,  res) {
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

  getPolls: function (req, res) {
    var parameters = getParameters(req);

    var jobs = [
      function (next) {
        Poll.find(parameters).exec(next);
      },
      function (next) {
        Poll.count(next)
      }
    ];

    async.parallel(jobs, asyncComplete(req, res, 'Poll', ['id', 'summary', 'createdAt']));
  },

  getPollOptions: function (req, res) {
    var parameters = getParameters(req);
    var pollId = req.param('pollId');
    parameters['where'] = {poll: pollId};
    res.locals['pollId'] = pollId;

    var jobs = [
      function (next) {
        PollOption.find(parameters).exec(next);
      },
      function (next) {
        PollOption.count(parameters['where']).exec(next);
      }
    ];

    async.parallel(jobs, asyncComplete(req, res, 'PollOption', ['id', 'text', 'amount']));
  },

  getComments: function(req, res) {
    var parameters = getParameters(req);

    var jobs = [
      function (next) {
        Comment.find(parameters).populate('author').exec(next);
      },
      function (next) {
        Comment.count(next)
      }
    ];

    async.parallel(jobs, asyncComplete(req, res, 'Comment', ['ip', 'text', 'createdAt']));
  },

  showSlides: function (req, res) {
    var parameters = getParameters(req);

    var jobs = [
      function (next) {
        Slide.find(parameters).exec(next);
      },
      function (next) {
        Slide.count(next)
      }
    ];

    async.parallel(jobs, asyncComplete(req, res, 'Slide', ['title', 'link', 'image']));
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


    Actor.find(options, {select: ['id', 'firstName', 'lastName']}).exec(function (error, actors) {
      if (error)
        return res.serverError(error);
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

    Movie.find(options, {select: ['id', 'name']}).exec(function (error, movies) {
      if (error)
        return res.serverError(error);
      movies.forEach(function (movie, i) {
        movies[i] = {id: movie.id, text: movie.name}
      });
      return res.json({results: movies});
    })
  }
};
