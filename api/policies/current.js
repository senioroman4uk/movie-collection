/**
 * Created by Vladyslav on 20.01.2016.
 */

module.exports = function (req, res, next) {
  if (req.param('id') == req.session.user.id)
    return next();


  req.session.flash.danger.push("You are not allowed to be here");
  return res.redirect('/');
};
