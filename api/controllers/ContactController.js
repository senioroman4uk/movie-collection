/**
 * Created by Vladyslav on 03.10.2015.
 */

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
  create: function(req, res) {
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

  find:function (req, res) {
    var page = 1, limit = req.param('limit', 10);

    if (req.xhr && req.wantsJSON && req.param('page'))
      page = req.param('page');

    Contact.find()
      .paginate({page: page, limit: limit})
      .exec(findHandler(req, res));
  }
};
