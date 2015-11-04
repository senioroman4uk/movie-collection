/**
 * PagesController.js
 * Created by Vladyslav on 13.09.2015.
 *
 * @description :: Logic for static pages
 */

var creationCallback = function(req, res) {
  return function(err, data) {
    if (err)
      return res.badRequest(err);
    return res.json(data);
  };
};

module.exports = {
  contact: function (req, res) {
    return res.view('static/contact', {page: 'Contact'});
  },

  subscribe: function subscribe(req, res) {
    var data = {email: req.param('email', '')};
    Subscribe.validate(data, validationCallback);

    function validationCallback(error) {
      if (error)
        return res.json(400, error);
      Subscribe.create(data, creationCallback);
    }

    function creationCallback(error, data) {
      return error ? res.json(400, error) : res.json(201, data);
    }
  },

  create: function(req, res) {
    var data = req.params.all();
    delete data['id'];
    Page.create(data, creationCallback(req, res))
  },

  update: function(req, res) {
    var data = req.params.all();
    var id = data['id'];
    delete data['id'];
    Page.update(id, data).exec(creationCallback(req, res));
  }
};
