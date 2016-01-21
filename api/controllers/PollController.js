/**
 * VotesController
 *
 * @description :: Server-side logic for managing votes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  create: function (req, res) {
    var parameters = req.params.all();
    delete parameters['id'];

    if (typeof parameters['active'] !== 'undefined')
      parameters['active'] = parameters['active'] === 'on' ? 1 : 0;
    else
      parameters['active'] = 0;

    sails.log.info(parameters);
    Poll.create(parameters, function (err, poll) {
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
        return res.redirect('/dashboard/polls');
      }

      req.session.flash.success.push("Poll was created");
      return res.redirect('/dashboard/polls');
    });
  },

  update: function (req, res) {
    var id = req.param('id');

    var parameters = req.params.all();

    delete parameters['id'];

    Poll.update(id, parameters, function (err, polls) {
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

        //req.session.flash.flashData['vm'] = parameters;
      }
      return res.redirect('/dashboard/polls/');
    })
  },

  destroy: function (req, res) {
    var id = req.param('id', null);

    Poll.destroy(id, function (err, data) {
      if (err) {
        sails.log.error(err);
        req.session.flash.danger.push("deleting failed");
        return res.redirect('/dashboard/polls');
      }
    })
  },

  createOption: function (req, res) {
    var parameters = req.params.all();
    delete parameters['id'];

    var poll = parameters['poll'];

    PollOption.create(parameters, function (err, option) {
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

        req.session.flash.flashData['vm'] = parameters;
        return res.redirect('/dashboard/polls');
      }

      req.session.flash.success.push("Option was created successfully");
      return res.redirect('/dashboard/polls/' + poll + '/options');
    });
  },

  destroyOption: actionService.simpleDestroy('pollOption', 'polls'),

  vote: function (req, res) {
    var optionId = req.param('option');

    PollOption.findOne(optionId).populateAll().exex(function (err, option) {
      if (err)
        return res.negotiate(err);

      var ip = req.ip.replace('::ffff:', '');
      var user = typeof req.session.user === 'undefined' ? null : req.session.user.id;
      var votes = option.results.find(function (element) {
        return element.ip === ip && (user == null && element.user == null) ||
          (user != null && element.user.id === user);
      });
      if (votes.length > 0) {
        //alreadyVoted;
      }

      option.votes.add({ip: ip, user: user});
      option.save(function (err, option) {
        if (err)
          return res.negotiate(err);


        return res.redirect(req.get('referrer') || '/');
      });
    });
  }
};

