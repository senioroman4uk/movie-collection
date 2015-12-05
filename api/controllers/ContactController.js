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
var findHandler = function (req, res, limit, page) {
  return function (error, data) {
    var count = data[1];
    var contacts = data[0];
    var nums = paginationService.paginate(page, limit, count);

    if (error)
      return res.serverError(error);
    else if (contacts.length === 0)
      return res.notFound();
    else {
      var type = req.accepts(['html', 'xml', 'json']);
      switch (type) {
        case 'html' :
          return res.view('contact/new', {
            title: 'Contact us',
            _page: page,
            _limit: limit,
            _n: nums[0],
            _i: nums[1],
            _count: nums[2],
            _link: '/contact?page',
            contacts: contacts,
            _moment: sails.moment
          });
          break;
        case 'xml':

          break;

        case 'json':
          if (req.param('ajax')) {
            sails.hooks.views.render('contact/new', {
              title: 'Contact us',
              _page: page,
              _limit: limit,
              _n: nums[0],
              _i: nums[1],
              _count: nums[2],
              _link: '/contact?page',
              contacts: contacts,
              _moment: sails.moment,
              req: req,
              layout: null,
              flash: res.locals.flash
            }, function (error, html) {
              if (error)
                return res.serverError(error);
              return res.json(200, {title: utilService.makeTitle('Contact us'), html: html})
            });
          }
          else {
            return res.json(200, {
              title: utilService.makeTitle('Contact us'), template: '<tr><td><%- contact.name       %></td>' +
              '<td><%- contact.email      %></td>' +
              '<td><%- contact.message    %></td>' +
              '<td><%- contact.answer     %></td>' +
              '<td><%- _moment(contact.createdAt).format(\'DD.MM.YYYY HH:mm:ss\')  %></td></tr>', contacts: contacts
            });
          }
          break;
        default :
          return res.badRequest();
          break;
      }
    }
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
      if (req.wantsJSON)
        return error ? res.json(400, error) : res.json(201, data);
      else {
        if (error) {
          try {
            for (var key in error.Errors) {
              if (error.Errors.hasOwnProperty(key))
                req.session.flash.danger.push(key + ': ' + error.Errors[key][0].message)
            }
          } catch (e) {
            req.session.flash.danger.push('Unknown error occurred while saving your message');
          }
        }
        else
          req.session.flash.success.push("We will contact with you soon, " + data.name);
        res.redirect('/contact');
      }
    }
  },

  find: function (req, res) {
    var page = req.param('page', 1) || 1;
    var limit = Math.min(req.param('limit', 10), 10);

    var jobs = [
      function (next) {
        Contact.find({answer: {'!': null}}).paginate({page: page, limit: limit}).exec(next);
      },

      function (next) {
        Contact.count({answer: {'!': null}}).exec(next);
      }
    ];

    async.parallel(jobs, findHandler(req, res, limit, page));
  },

  update: function (req, res) {
    var id = req.param('id', null);
    if (id == null)
      return res.badRequest();

    var data = req.params.all();
    delete data['id'];
    Contact.update(id, data).exec(function (error, data) {
      if (error)
        return res.serverError(error);

      return res.json(data);
    })
  },

  destroy: function (req, res) {
    var id = req.param('id');

    Contact.destroy(id, function (error, data) {
      if (error)
        return res.serverError(error);
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

    async.parallel(jobs, function (error, data) {
      if (error)
        return res.serverError(error);
      return res.json({rows: data[0], total: data[1]})
    })
  }
};
