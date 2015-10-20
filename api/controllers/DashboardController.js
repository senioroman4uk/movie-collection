/**
 * Created by Vladyslav on 18.10.2015.
 */

var async = require('async');

module.exports = {
  index: function (req, res) {
    return res.view({layout: '/layouts/dashboardLayout'});
  },

  getGenres: function (req, res) {
    var limit = Math.min(req.param('limit', 10), 20),
        skip = req.param('offset', 0),
        sort = req.param('sort', ''),
        order = req.param('order', '');

    var params = {skip: skip, limit: limit};
    if (order !== '' && sort !== '')
      params.sort = sort + ' ' + order;

    if (!req.xhr || !req.wantsJSON)
      return res.view({layout: '/layouts/dashboardLayout'});

    var jobs = [
      function (next) {
          Genre.find(params, next);
      },
      function (next) {
        Genre.count(next);
      }
    ];

    async.parallel(jobs, function(err, data) {
      if (err)
        return res.serverError();
      else
        return res.json({rows: data[0], total: data[1]})
    });
  },

  getMovies: function(req, res) {
    var limit = Math.min(req.param('limit', 10), 20),
        skip = req.param('offset', 0),
        sort = req.param('sort', ''),
        order = req.param('order', '');

    if (!req.xhr || !req.wantsJSON)
      return res.view({layout: '/layouts/dashboardLayout'});

    var query = Movie.find({skip: skip, limit: limit}).populateAll();
    if (order !== '' && sort !== '')
      query = query.sort(sort + ' ' + order);

    query.exec(function(err, data) {
      if (err)
        return res.serverError();
      Movie.count(function(err, count) {
        if (err)
          return res.serverError();
        return res.json({rows: data, total: count})
      });
    });
  }
};
