/**
 * ActorController
 *
 * @description :: Server-side logic for managing Actors
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var path = require('path');

var actorRender = function (actor) {
  return function (next) {
    sails.hooks.views.render('partials/actor', {actor: actor, layout: null}, function(err, html) {
      if (err)
        next(err);
      next(null, {id: actor.id,  html: html} );
    });
  }
};

function findHandler(req, res) {
  return function(error, actors) {
    var response;

    if (error)
      response = res.serverError();
    else if(actors.length === 0)
      response = res.notFound();
    else {
      if (req.xhr && req.wantsJSON) {
        var jobs = [];
        //creating jobs for rendering the movies
        for (var i = 0; i < actors.length; i++)
          jobs.push(actorRender(actors[i]));

        //rendering movies in parallel
        async.parallel(jobs, function (err, data) {
          return err ? res.serverError() : res.json(data);
        })
      }
      else
        response = res.view({page: 'Actors', actors: actors});
    }
    return response;
  }
}

function findOneHandler(req, res) {
  return function(error, actor) {
    var response;
    if (error)
      response = res.serverError();
    else if (!(!!actor))
      response = res.notFound();
    else {
      response = res.view('actor/findone',
        {page: actor.getName(), actor: actor, hideReadMore: true});
    }
    return response
  }
}

module.exports = {
  find: function (req, res) {
    var page = req.param('page', 1), limit = req.param('limit', 1);

    Actor.find().paginate({page: page, limit: limit}).exec(findHandler(req, res));
  },

  findOne: function (req, res) {
    var id = req.param('id', '');

    Actor.findOne(id).populate('movies', {sort: 'year'}).exec(findOneHandler(req, res));
  },

  update: function(req, res) {
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
      Actor.update(id, data).exec(function(err, data) {
        if (err)
          return res.badRequest(err);

        return res.json(data);
      });
    });
  },

  create: function(req, res) {
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
      Actor.create(data).exec(function(err, data) {
        if (err)
          return res.badRequest(err);

        return res.json(data);
      });
    });
  }
};
