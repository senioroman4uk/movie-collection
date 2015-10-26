/**
 * Created by Vladyslav on 17.10.2015.
 */

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

      if (user.access === 2)
        return next();
      else
        return res.redirect('/login');
    });
    return;
  }

  return res.redirect('/login');
};
