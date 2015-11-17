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
var moment = require('moment');
var fs = require('fs');


//Controller Callbacks
var findOneHandler = function (req, res) {
  return function (error, movie) {
    var response;

    if (error)
      response = res.serverError(error);
    else if (!!movie === false)
      response = res.notFound();
    else {
      if (Object.prototype.toString.call(movie) === '[object Array]')
        movie = movie[0];

      response = res.view('movie/findone',
        {page: movie.name, movie: movie, hideReadMore: true, _moment: sails.moment});
    }

    return response;
  }
};

var findHandler = function (req, res, limit, page, where) {
  var whereKeys = ['genre', 'year'];

  return function (error, data) {
    var response;
    var movies = data[0];
    var count = data[1];

    if (error)
      response = res.serverError(error);
    else if (movies.length === 0)
      response = res.notFound();
    else {

      //detecting type of response that was preferred
      var type = req.accepts(['html', 'xml', 'json']);
      switch (type) {
        case 'html' :
          //returning plain view
          var nums = paginationService.paginate(page, limit, count);
          var link = '/movies?';
          whereKeys.every(function (key) {
            if (!!where[key] === true) {
              link += key + '=' + where[key] + '&';
              return false;
            }

            return true;
          });
          link += 'page';

          response = res.view({
            title: 'Movies',
            _page: page,
            _limit: limit,
            _n: nums[0],
            _i: nums[1],
            _count: nums[2],
            _link: link,
            movies: movies,
            _moment: moment
          });
          break;
        //TODO: Refactor
        case 'xml' :
          //starting xml document
          var xw = new xml().startDocument().startElement('Movies');

          //processing each record from database
          movies.forEach(function (movie) {
              xw = xw.startElement('Movie');

              //removing actos collection, it is empty, but it is still here
              delete movie.actors;

              //converting dates to stings for xml
              var dates = ['createdAt', 'updatedAt'];
              for (var i = 0; i < dates.length; i++)
                movie[dates[i]] = actor[dates[i]].toString();

              for (var key in movie) {
                if (movie.hasOwnProperty(key))
                  xw = xw.startElement(key).text(actor[key]).endElement(key);
              }

              xw = xw.endElement('Actor');
          });

          //finishing xml document
          xw = xw.endElement('Movies').endDocument();

          //setting Content-Type
          res.set('Content-Type', 'application/xml');
          response = res.send(200, xw.toString());
          break;
        case 'json' :
          fs.readFile('views/partials/movie.ejs', 'utf8', function (error, template) {
            if (error)
              return res.serverError(error);

            return res.json({title: utilService.makeTitle('Movies'), template: template, movies: movies});
          });
          break;
        default :
          response = res.badRequest();
          break;
      }
    }

    return response;
  }
};

var randomHandler = function (req, res) {
  return function (error, rows) {
    var response;
    if (error)
      response = res.serverError(error);
    else if (rows.length === 0)
      response = res.notFound();
    else {
      var id = rows[0].id;
      Movie.findOne(id).populate('genres').populate('actors').exec(findOneHandler(req, res));
    }
    return response;
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

      res.set('Content-Type', 'application/rss+xml');
      return res.send(200, rss.getFeedXML(feed));
    });
  },

  find: function (req, res) {
    var page = req.param('page', 1) || 1,
      limit = Math.min(req.param('limit', 10), 1);
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

    async.parallel(paralelJobs, findHandler(req, res, limit, page, getParameters));
  },

  //Getting information about single movie
  findOne: function (req, res) {
    var link = req.param('link', '');

    Movie.findOneByLink(link).populate('genres').populate('actors').exec(findOneHandler(req, res));
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
