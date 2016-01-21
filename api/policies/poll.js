/**
 * Created by Vladyslav on 05.01.2016.
 */

module.exports = function (req, res, next) {
  Poll.findOne({active: 1}).populateAll().exec(function (err, poll) {
    if (err)
      return res.negotiate(err);

    // if no active poll proceeding to the next policy
    res.locals.activePoll = poll ? poll : null;
    next();
    //TODO: check if voted here ?
  });
};
