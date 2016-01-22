/**
 * Created by Vladyslav on 18.01.2016.
 */

module.exports = {
  create: function (req, res) {
    var parameters = req.params.all();
    delete parameters['id'];

    Slide.create(parameters, function (err, slide) {
      if (err) {
        sails.log.error(err);
        try {
          for (var error in err.Errors) {
            var message = err.Errors[error][0].message;
            req.session.flash.danger.push(error + ': ' + message);
          }
        } catch (ex) {
          req.session.flash.danger.push('Unknown error occurred');
        }

        req.session.flash.flashData['vm'] = parameters;
        return res.redirect('/dashboard/slides');
      }

      req.session.flash.success.push("Slide was created");
      return res.redirect('/dashboard/slides');
    });
  },

  update: function (req, res) {
    var id = req.param('id');
    var parameters = req.params.all();
    delete parameters['id'];

    Slide.update(id, parameters, function (err, items) {
      if (err) {
        sails.log.error(err);
        var errorHandled = false;

        try {
          for (var error in err.Errors) {
            var message = err.Errors[error][0].message;
            req.session.flash.danger.push(error + ': ' + message);
            errorHandled = true;
          }
        } catch (ex) {
          req.session.flash.danger.push('Unknown error occurred');
          errorHandled = true;
        }

        if (errorHandled === false)
          req.session.flash.danger.push('Operation failed');
      }
      return res.redirect('/dashboard/slides/');
    })
  },

  destroy: function (req, res) {
    var id = req.param('id', null);

    Slide.destroy(id, function (err, data) {
      if (err) {
        sails.log.error(err);
        req.session.flash.danger.push("deleting failed");
      }
      else
        req.session.flash.success.push("Operation successful");

      return res.redirect('/dashboard/slides');
    })
  }
};
