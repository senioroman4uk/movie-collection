/**
 * Created by Vladyslav on 18.01.2016.
 */

module.exports = function (req, res, next) {
  //getting slides
  Slide.find({}, function (err, slides) {
    if (err) {
      sails.log(error);
      slides = [];
    }

    res.locals._slides = slides;
    next();
  });
};
