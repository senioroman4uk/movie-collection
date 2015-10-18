/**
 * Created by Vladyslav on 17.10.2015.
 */
var crypto = require('crypto');

module.exports = {
  logIn: function(req, res, user, callback) {
    var hash = crypto.createHash('sha256');
    hash.update(user.password + req.ip);

    user.token = hash.digest('hex');
    user.save(function(err) {
      if (err) {
        req.session.flash['danger'].push('failed to login');
        return res.redirect('/login');
      }
      else{
        req.session.user = user;
        req.session.authenticated = true;
        if (callback)
          callback(req, res);
      }
    });
  },

  //TODO: DELETE token?
  logOut: function(req) {
    delete req.session.user;
    req.session.authenticated = false;

  }
};
