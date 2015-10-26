/**
 * MovieController
 *
 * @description :: Server-side logic for managing Movies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var path = require('path');

var movieRender = function (movie) {
  return function (next) {
    sails.hooks.views.render('partials/movie', {movie: movie, layout: null}, function (err, html) {
      if (err)
        next(err);
      next(null, {id: movie.id, html: html});
    });
  }
};

//Controller Callbacks
var findOneHandler = function (req, res) {
  return function (error, movie) {
    var response;

    if (error)
      response = res.serverError();
    else if (!(!!movie))
      response = res.notFound();
    else {
      if (Object.prototype.toString.call(movie) === '[object Array]')
        movie = movie[0];

      response = res.view('movie/findone',
        {page: movie.name, movie: movie, hideReadMore: true});
    }

    return response;
  }
};

var findHandler = function (req, res) {
  return function (error, movies) {
    var response;

    if (error)
      response = res.serverError();
    else if (movies.length === 0)
      response = res.notFound();
    else {
      if (req.xhr && req.wantsJSON) {
        var jobs = [];
        //creating jobs for rendering the movies
        for (var i = 0; i < movies.length; i++)
          jobs.push(movieRender(movies[i]));

        //rendering movies in parallel
        async.parallel(jobs, function (err, data) {
          return err ? res.serverError() : res.json(data);
        })
      }
      else
        response = res.view({page: 'Movies', movies: movies});
    }

    return response;
  }
};

var randomHandler = function (req, res) {
  return function (error, rows) {
    var response;
    if (error)
      response = res.serverError();
    else if (rows.length === 0)
      response = res.notFound();
    else {
      var id = rows[0].id;
      Movie.findOne(id).populate('genres').populate('actors').exec(findOneHandler(req, res));
    }
    return response;
  }
};

var findByGenreHandler = function (req, res) {
  return function (error, rows) {
    var response;
    if (error)
      response = res.serverError();
    else if (rows.length === 0)
      response = res.notFound();
    else {
      var ids = [];
      for (var i = 0; i < rows.length; i++)
        ids.push(rows[i].id);
      Movie.find(ids).populate('genres', {sort: 'name'}).exec(findHandler(req, res));
    }
    return response;
  }
};

module.exports = {
  find: function (req, res) {
    var page = 1, limit = req.param('limit', 10);
    var where = {};
    var allowedParameters = ['year'];

    if (req.xhr && req.wantsJSON && req.param('page'))
      page = req.param('page');

    for (var i = 0; i < allowedParameters.length; i++)
      if (req.param(allowedParameters[i]))
        where[allowedParameters[i]] = req.param(allowedParameters[i]);

    if (req.param('genre')) {
      var sql = 'SELECT movie.id ' +
        'FROM genre_movies__movie_genres JOIN movie on(movie.id = genre_movies__movie_genres.movie_genres) ' +
        'WHERE genre_movies = ? ' +
        'LIMIT ?, ?';
      Movie.query(sql, [req.param('genre'), (page - 1) * limit, page * limit], findByGenreHandler(req, res));
    }
    else {
      Movie.find(where).populate('genres', {sort: 'name'})
        .paginate({page: page, limit: limit})
        .exec(findHandler(req, res));
    }
  },

  //Getting information about single movie
  findOne: decoratorService.getPagesDecorator(function (req, res) {
    var id = req.param('id', '');

    Movie.findOne(id).populate('genres').populate('actors').exec(findOneHandler(req, res));
  }),

  //Getting information about single random movie
  random: decoratorService.getPagesDecorator(function (req, res) {
    Movie.query('SELECT id FROM movie ORDER BY RAND() LIMIT 1', randomHandler(req, res));
  }),

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
      Movie.update(id, data).exec(function(err, data) {
        if (err)
          return res.badRequest(err);

        return res.json(data);
      });
    });

  },

  create: function(req, res) {
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
      Movie.create(data).exec(function(err, data) {
        if (err)
          return res.badRequest(err);

        return res.json(data);
      });
    });
  }
};
