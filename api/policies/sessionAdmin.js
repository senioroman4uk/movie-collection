/**
 * Created by Vladyslav on 17.10.2015.
 */

module.exports = function (req, res, next) {

  if (req.session.authenticated && req.session.user != null) {
    User.findOne(req.session.user.id).exec(function (err, user) {
      if (err || !user)
        return res.redirect('/login');
      else {
        if (user.role === 2)
          return next();
        else
          return res.redirect('/login');
      }
    });
    return;
  }

  return res.redirect('/login');
};
