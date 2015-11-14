/**
 * ActorController
 *
 * @description :: Server-side logic for managing Actors
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var path = require('path');
var rss = require('node-rss');
var xml = require('xml-writer');

//async task that renders partial view for actor
var actorRender = function (actor) {
  return function (next) {

    /* trigger rendering of partial manually
     * layout : null says that the view is partial
     * hook for views was fixed to support model custom methods
     */
    sails.hooks.views.render('partials/actor', {actor: actor, layout: null}, function (err, html) {
      if (err)
        next(err);
      next(null, {id: actor.id, html: html});
    });
  }
};

//handler for Actor.find()
function findHandler(req, res) {
  return function (error, actors) {
    var response;

    if (error)
      response = res.serverError(error);
    else if (actors.length === 0)
      response = res.notFound();
    else {
      //detecting type of response that was preferred
      var type = req.accepts(['html', 'xml', 'json']);
      switch (type) {
        case 'html' :
          //returning plain view
          response = res.view({page: 'Actors', actors: actors});
          break;
        case 'xml' :
          //starting xml document
          var xw = new xml().startDocument().startElement('actors');

          //processing each record from database
          actors.forEach(function (actor) {
              xw = xw.startElement('Actor');

              //removing movies collection, it is empty, but it is here
              delete actor.movies;

              //converting dates to stings for xml
              var dates = ['createdAt', 'updatedAt', 'birthDate'];
              for (var i = 0; i < dates.length; i++)
                actor[dates[i]] = actor[dates[i]].toString();

              for (var key in actor) {
                if (actor.hasOwnProperty(key))
                  xw = xw.startElement(key).text(actor[key]).endElement(key);
              }

              xw = xw.endElement('Actor');
            }
          );

          //finishing xml document
          xw = xw.endElement('actors').endDocument();

          //setting Content-Type
          res.set('Content-Type', 'application/xml');
          response = res.send(200, xw.toString());
          break;
        case 'json' :
          var jobs = [];
          //creating jobs for rendering the movies
          for (var i = 0; i < actors.length; i++)
            jobs.push(actorRender(actors[i]));

          //rendering movies in parallel
          async.parallel(jobs, function (err, data) {
            return err ? res.serverError() : res.json(data);
          });
          break;
        default :
          response = res.badRequest();
          break;
      }
    }
    return response;
  }
}

//handler for Actor.findOne()
function findOneHandler(req, res) {
  return function (error, actor) {
    var response;
    if (error)
      response = res.serverError(error);
    else if (!!actor === false)
      response = res.notFound();
    else {
      response = res.view('actor/findone',
        {page: actor.getName(), actor: actor, hideReadMore: true});
    }
    return response
  }
}

module.exports = {
  getRss: function (req, res) {
    Actor.find().sort('createdAt DESC').limit(10).exec(function (err, data) {
      if (err)
        return res.serverError();
      if (data.length === 0)
        return res.notFound();

      //generating rss
      var feed = rss.createNewFeed('Most recent actors',
        'localhost:1337/actors',
        'Most recent actors from our web-site',
        'Vladyslav Romanchuk',
        'http://localhost:1337/actors/rss',
        {'Category': 'Actors'});
      //adding items to feed
      data.forEach(function (element) {
        feed.addNewItem(element.getName(), '/actors/' + element.link, element.createdAt, element.generalInfo, {});
      });

      //setting Content-Type
      res.set('Content-Type', 'application/rss+xml');
      return res.send(200, rss.getFeedXML(feed));
    });
  },

  find: function (req, res) {
    var page = req.param('page', 1), limit = Math.min(req.param('limit', 1), 20);
    Actor.find().paginate({page: page, limit: limit}).exec(findHandler(req, res));
  },

  findOne: function (req, res) {
    var link = req.param('link', '');
    Actor.findOneByLink(link).populate('movies', {sort: 'year'}).exec(findOneHandler(req, res));
  },

  update: function (req, res) {
    req.file('cover').upload({
      dirname: '../../assets/images/actors',
      maxBytes: 10000000
    }, function whenDone(err, uploadedFiles) {
      if (err)
        return res.negotiate(err);

      var data = req.params.all();
      if (!!data.birthDate === true) {
        var parts = data.birthDate.split('.');
        var day = parts[0];
        parts[0] = parts[1];
        parts[1] = day;
        data['birthDate'] = new Date(parts.join('.'));
      }
      console.log(data);
      var id = data['id'];
      delete data['id'];

      if (uploadedFiles.length > 0) {
        data['cover'] = path.basename(uploadedFiles[0].fd);
      }
      Actor.update(id, data).exec(function (err, data) {
        if (err)
          return res.badRequest(err);

        return res.json(data);
      });
    });
  },

  create: function (req, res) {
    req.file('cover').upload({
      dirname: '../../assets/images/actors',
      maxBytes: 10000000
    }, function whenDone(err, uploadedFiles) {
      if (err)
        return res.negotiate(err);

      var data = req.params.all();
      delete data['id'];
      if (!!data.birthDate === true) {
        var parts = data.birthDate.split('.');
        var day = parts[0];
        parts[0] = parts[1];
        parts[1] = day;
        data['birthDate'] = new Date(parts.join('.'));
      }

      if (uploadedFiles.length > 0) {
        data['cover'] = path.basename(uploadedFiles[0].fd);
      }
      Actor.create(data).exec(function (err, data) {
        if (err)
          return res.badRequest(err);

        return res.json(data);
      });
    });
  }
};
