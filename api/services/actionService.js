/**
 * Created by Vladyslav on 03.01.2016.
 */

var async = require('async');
var path = require('path');


var updateAction = function (model, collections) {
  return function (req, res) {
    var id = req.param('id');
    var context = this;

    var jobs = [
      function (next) {
        sails.models[model].findOne(id).populateAll().exec(next);
      },

      function (item, next) {
        context.oldItem = _.clone(item);
        var parameters = req.params.all();

        for (var i = 0; i < collections.length; i++)
          if (typeof parameters[collections[i]] === 'undefined')
            parameters[collections[i]] = [];


        delete parameters['cover'];
        delete parameters['id'];

        for (var prop in item) {
          if (item.hasOwnProperty(prop) && parameters.hasOwnProperty(prop)) {
            item[prop] = parameters[prop];
          }
        }

        item.validate(function (errors) {
          next(errors, item);
        });
      },

      function (item, next) {
        context.newItem = item;

        req.file('cover').upload({
          dirname: path.resolve(sails.config.appPath, '.tmp/public/images/' + model + 's'),
          maxBytes: 10000000
        }, next);
      },

      function (uploadedFiles, next) {
        if (uploadedFiles.length > 0) {
          context.newItem.cover = path.basename(uploadedFiles[0].fd);
        }
        sails.models[model].update(id, context.newItem).exec(next);
      },

      function (savedItem, next) {
        savedItem = savedItem[0];
        if (context.oldItem.cover !== savedItem.cover) {
          coverService.completeDeleteCover(context.oldItem, model + 's', next);
          return;
        }
        next();
      }
    ];

    async.waterfall(jobs, function (err) {
      if (err) {
        return res.negotiate(err);
      }

      return res.json(context.newItem);
    });
  }
};

var createAction = function (model, collections) {
  return function (req, res) {
    var context = this;

    var jobs = [
      function (next) {
        var parameters = req.params.all();

        for (var i = 0; i < collections.length; i++)
          if (typeof parameters[collections[i]] === 'undefined')
            parameters[collections[i]] = [];

        delete parameters['cover'];
        delete parameters['id'];

        context.item = parameters;
        req.file('cover').upload({
          dirname: path.resolve(sails.config.appPath, '.tmp/public/images/' + model + 's'),
          maxBytes: 10000000
        }, next)
      },

      function (uploadedFiles, next) {
        if (uploadedFiles.length > 0) {
          context.item.cover = path.basename(uploadedFiles[0].fd);
        }
        sails.models[model].create(context.item).exec(next);
      }
    ];

    async.waterfall(jobs, function (err, item) {
      if (err)
        return res.negotiate(err);
      return res.json(item);
    });
  }
};

module.exports = {
  updateAction: updateAction,
  createAction: createAction
};
