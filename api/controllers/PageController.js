/**
 * PagesController.js
 * Created by Vladyslav on 13.09.2015.
 *
 * @description :: Logic for static pages
 */

module.exports = {
  contact: decoratorService.getPagesDecorator(function (req, res) {
    return res.view('static/contact', {page: 'Contact'});
  }),

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
  }
};
