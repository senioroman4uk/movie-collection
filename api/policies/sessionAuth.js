/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
var crypto = require('crypto');

module.exports = function (req, res, next) {

  if (req.session.authenticated && req.session.user != null) {
    User.findOne(req.session.user.id).exec(function (err, user) {
      if (err) {
        console.log(err);
        return res.serverError();
      }

      //user not found
      if (!!user === false) {
        sessionService.logOut(req);
        return res.redirect('/login');
      }

      var hash = crypto.createHash('sha256');
      hash.update(user.password + req.ip);

      if (user.token === hash.digest('hex'))
        next();
      else {
        sessionService.logOut(req);
        return res.redirect('/login');
      }
    });
  }
  else
    return res.redirect('/login');
};
