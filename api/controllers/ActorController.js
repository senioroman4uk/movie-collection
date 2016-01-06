/**
 * ActorController
 *
 * @description :: Server-side logic for managing Actors
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var rss = require('node-rss');


module.exports = {
  getRss: function (req, res) {
    Actor.find().sort('createdAt DESC').limit(10).exec(function (error, data) {
      if (error)
        return res.serverError(error);
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
    var page = req.param('page', 1) || 1,
      limit = Math.min(req.param('limit', 1), 10);

    var jobs = [
      function (next) {
        Actor.find().paginate({page: page, limit: limit}).exec(next);
      },

      function (next) {
        Actor.count().exec(next);
      }
    ];

    async.parallel(jobs, queryHandlerService.find(req, res, limit, page, {}, 'actor', 'actors', []));
  },

  findOne: function (req, res) {
    var link = req.param('link', '');
    Actor.findOneByLink(link).populate('movies', {sort: 'year DESC'}).exec(queryHandlerService.findOne(req, res, 'actor'));
  },

  update: actionService.updateAction('actor', ['movies']),

  create: actionService.createAction('actor', ['movies'])
};
