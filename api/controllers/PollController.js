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
      }
      else
        req.session.flash.success.push("Operation successful");

      return res.redirect('/dashboard/polls');
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

  destroyOption: actionService.simpleDestroy('pollOption', '/dashboard/polls/:id/options'),

  find: function (req, res) {
    var page = req.param('page', 1),
      limit = Math.min(req.param('limit', 5), 5);

    var jobs = [
      function (next) {
        Poll.find().paginate({page: page, limit: limit}).exec(next);
      },

      function (next) {
        Poll.count().exec(next);
      }
    ];

    async.parallel(jobs, queryHandlerService.find(req, res, limit, page, {}, 'poll', 'polls', []));
  },

  findOne: function (req, res) {
    var id = req.param('id', '');
    Poll.findOne(id).populateAll().exec(queryHandlerService.findOne(req, res, 'poll'));
  },

  vote: function (req, res) {
    var optionId = req.param('option');
    var pollId = req.param('pollId', -1);

    if (pollId === -1) {
      req.session.flash.danger.push("poll not found");
      return res.redirect('/polls');
    }


    PollOption.findOne(optionId).populateAll().exec(function (err, option) {
      if (err) {
        sails.log(err);
        req.session.flash.danger.push('operation failed');
        return res.redirect('/polls/' + pollId);
      }

      if (!!option === false) {
        req.session.flash.danger.push("Option not found");
        return res.redirect('/polls/' + pollId)
      }

      PollOption.query('SELECT op.id ' +
        'FROM poll p ' +
        'JOIN polloption op on(p.id = op.poll) ' +
        'JOIN pollresult pr on (op.id = pr.option) ' +
        'WHERE p.id = $1 AND pr.user = $2', [pollId, req.session.user.id], function (err, results) {
        if (err) {
          sails.log(err);
          req.session.flash.danger.push('operation failed');
          return res.redirect('/polls/' + pollId);
        }

        if (results.rows.length > 0) {
            req.session.flash.danger.push('you have already voted');
            return res.redirect('/polls/' + pollId);
        }

        var ip = req.ip.replace('::ffff:', '');


        option.results.add({ip: ip, user: req.session.user.id});
        option.amount++;

        option.save(function (err, option) {
          if (err) {
            sails.log(err);
            req.session.flash.danger.push('saving failed');
            return res.redirect('/polls/' + pollId);
          }

          req.session.flash.success.push("You have voted successfully");
          return res.redirect('/polls/' + pollId);
        });
      });
    });
  }
};

