/**
 * ActorController
 *
 * @description :: Server-side logic for managing Actors
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
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
  find: decoratorService.getPagesDecorator(function (req, res) {
    var page = req.param('page', 1), limit = req.param('limit', 1);

    Actor.find().paginate({page: page, limit: limit}).exec(findHandler(req, res));
  }),

  findOne: decoratorService.getPagesDecorator(function (req, res) {
    var id = req.param('id', '');

    Actor.findOne(id).populate('movies', {sort: 'year'}).exec(findOneHandler(req, res));
  })
};
