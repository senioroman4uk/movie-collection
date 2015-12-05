/**
 * ActorController
 *
 * @description :: Server-side logic for managing Actors
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var path = require('path');
var rss = require('node-rss');
var xml = require('xml-writer');
var fs = require('fs');


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
    Actor.findOneByLink(link).populate('movies', {sort: 'year'}).exec(queryHandlerService.findOne(req, res, 'actor'));
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
