/**
 * Created by Vladyslav on 17.10.2015.
 */

module.exports = function(req, res, next) {
  res.locals.flash = { success: [], danger: [], warning: [] };

  if(!req.session.flash) {
    req.session.flash = { success: [], danger: [], warning: [] };
    return next();
  }
  res.locals.flash = _.clone(req.session.flash);

  // Clear flash
  req.session.flash = { success: [], danger: [], warning: [] };
  return next();
};
