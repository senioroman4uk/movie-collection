/**
 * Created by Vladyslav on 03.10.2015.
 */

var async = require('async');
var getParameters = function (req) {
  var limit = Math.min(req.param('limit', 10), 20),
    skip = req.param('offset', 0),
    sort = req.param('sort', ''),
    order = req.param('order', '');

  var params = {skip: skip, limit: limit};
  if (order !== '' && sort !== '')
    params.sort = sort + ' ' + order;

  return params;
};
var findHandler = function (req, res) {
  return function (error, contacts) {
    var response;
    if (error)
      response = res.serverError();
    else {
      if (req.xhr && req.wantsJSON)
        response = res.json(contacts);
      else
        response = res.view({page: 'Contact messages', contacts: contacts});
    }

    return response;
  }
};

module.exports = {
  create: function (req, res) {
    var data = {
      email: req.param('email', ''),
      name: req.param('name', ''),
      message: req.param('message', ''),
      ip: req.ip.replace('::ffff:', '')
    };

    Contact.create(data, creationCallback);

    function creationCallback(error, data) {
      return error ? res.json(400, error) : res.json(201, data);
    }
  },

  find: function (req, res) {
    var page = 1, limit = req.param('limit', 10);

    if (req.xhr && req.wantsJSON && req.param('page'))
      page = req.param('page');

    Contact.find()
      .paginate({page: page, limit: limit})
      .exec(findHandler(req, res));
  },

  update: function (req, res) {
    var id = req.param('id', null);
    if (id == null)
      return res.badRequest();

    var data = req.params.all();
    console.log(data);
    console.log(id);
    delete data['id'];
    Contact.update(id, data).exec(function (err, data) {
      if (err)
        return res.serverError();

      return res.json(data);
    })
  },

  destroy: function (req, res) {
    var id = req.param('id');

    Contact.destroy(id, function (err, data) {
      if (err)
        return res.serverError();
      return res.json(data);
    })
  },

  findAnswered: function (req, res) {
    var parameters = getParameters(req);
    var where = {answer: {'!': null}};
    var jobs = [];

    jobs.push(function (next) {
      var criteria = parameters;
      criteria['where'] = where;
      Contact.find(criteria).exec(next);
    });

    jobs.push(function (next) {
      Contact.count(where).exec(next);
    });

    async.parallel(jobs, function(err, data) {
      if (err)
        return res.serverError();
      return res.json({rows: data[0], total: data[1]})
    })
  }
};
