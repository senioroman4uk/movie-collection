/**
 * MovieController
 *
 * @description :: Server-side logic for managing Movies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var path = require('path');
var rss = require('node-rss');
var xml = require('xml-writer');
var async = require('async');
var fs = require('fs');


//Controller Callbacks
var randomHandler = function (req, res) {
  return function (error, rows) {
    if (error)
      return res.serverError(error);
    else if (rows.length === 0)
      return res.notFound();
    else {
      var id = rows[0].id;
      Movie.findOne(id).populate('genres').populate('actors').exec(queryHandlerService.findOne(req, res, 'movie'));
    }
  }
};


module.exports = {
  getRss: function (req, res) {
    Movie.find().sort('createdAt DESC').limit(10).exec(function (error, data) {
      if (error)
        return res.serverError(error);
      if (data.length === 0)
        return res.notFound();
      var feed = rss.createNewFeed('Most recent movies',
        'localhost:1337/movies',
        'Most recent movies from our web-site',
        'Vladyslav Romanchuk',
        'http://localhost:1337/movies/rss',
        {'Category': 'Movies'});
      data.forEach(function (element) {
        feed.addNewItem(element.name, '/movies/' + element.link, element.createdAt, element.description, {});
      });

      //setting Content-Type
      res.set('Content-Type', 'application/rss+xml');
      return res.send(200, rss.getFeedXML(feed));
    });
  },

  //TODO: Refactor
  find: function (req, res) {
    var page = req.param('page', 1) || 1,
      limit = Math.min(req.param('limit', 10), 10);
    var where = {};
    var allowedParameters = ['year'];

    for (var i = 0; i < allowedParameters.length; i++)
      if (req.param(allowedParameters[i]))
        where[allowedParameters[i]] = req.param(allowedParameters[i]);


    var paralelJobs = [];

    var genre = req.param('genre', null);
    if (genre) {
      var sql = 'SELECT movie.id ' +
        'FROM genre_movies__movie_genres ' +
        'INNER JOIN movie on(movie.id = genre_movies__movie_genres.movie_genres) ' +
        'INNER JOIN genre on (genre.id = genre_movies__movie_genres.genre_movies) ' +
        "WHERE genre.name = ? " +
        'LIMIT ?, ?';

      var jobs = [];
      jobs.push(function (next) {
        Movie.query(sql, [genre, (page - 1) * limit, limit], next);
      });
      jobs.push(function (rows, next) {
        var ids = [];
        for (var i = 0; i < rows.length; i++)
          ids.push(rows[i].id);
        Movie.find(ids).populate('genres', {sort: 'name'}).exec(next);
      });

      paralelJobs.push(function (next) {
        async.waterfall(jobs, next);
      });

      var sql2 = 'SELECT COUNT(*) AS count ' +
        'FROM genre_movies__movie_genres ' +
        'INNER JOIN movie on(movie.id = genre_movies__movie_genres.movie_genres) ' +
        'INNER JOIN genre on (genre.id = genre_movies__movie_genres.genre_movies) ' +
        "WHERE genre.name = ? ";
      paralelJobs.push(function (next) {
        Movie.query(sql2, [genre], function (error, result) {
          if (error)
            next(error);
          next(null, result[0].count);
        });
      })
    }
    else {
      paralelJobs.push(function (next) {
        Movie.find(where).populate('genres', {sort: 'name'})
          .paginate({page: page, limit: limit})
          .exec(next);
      });
      paralelJobs.push(function (next) {
        Movie.count(where).exec(next);
      });
    }

    var getParameters = where;
    if (genre)
      getParameters['genre'] = genre;

    async.parallel(paralelJobs, queryHandlerService.find(req, res, limit, page, getParameters, 'movie', 'movies',
      ['genre', 'year']));
  },

  //Getting information about single movie
  findOne: function (req, res) {
    var link = req.param('link', '');

    Movie.findOneByLink(link).populate('genres').populate('actors').exec(queryHandlerService.findOne(req, res, 'movie'));
  },

  //Getting information about single random movie
  random: function (req, res) {
    Movie.query('SELECT id FROM movie ORDER BY RAND() LIMIT 1', randomHandler(req, res));
  },

  update: function (req, res) {
    req.file('cover').upload({
      dirname: '../../assets/images/movies',
      maxBytes: 10000000
    }, function whenDone(err, uploadedFiles) {
      if (err)
        return res.negotiate(err);

      var data = req.params.all();
      var id = data['id'];
      delete data['id'];

      if (uploadedFiles.length > 0) {
        data['cover'] = path.basename(uploadedFiles[0].fd);
      }
      Movie.update(id, data).exec(function (err, data) {
        if (err)
          return res.badRequest(err);

        return res.json(data);
      });
    });

  },

  create: function (req, res) {
    req.file('cover').upload({
      dirname: '../../assets/images/movies',
      maxBytes: 10000000
    }, function whenDone(err, uploadedFiles) {
      if (err)
        return res.negotiate(err);

      var data = req.params.all();
      delete data['id'];

      if (uploadedFiles.length > 0) {
        data['cover'] = path.basename(uploadedFiles[0].fd);
      }
      Movie.create(data).exec(function (err, data) {
        if (err)
          return res.badRequest(err);

        return res.json(data);
      });
    });
  },

  destroy: function (req, res) {
    var id = req.param('id');

    Movie.destroy(id, function (error, data) {
      if (error)
        return res.serverError(error);
      return res.json(data);
    });
  }
};
