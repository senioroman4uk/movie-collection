/**
 * Created by Vladyslav on 20.01.2016.
 */

module.exports = {
  create: function (req, res) {
    sails.log.info(req.session.user);
    var data = {
      ip: req.ip.replace('::ffff:', ''),
      author: req.session.user.id,
      articleType: req.param('articleType'),
      articleId: req.param('articleId'),
      text: req.param('text')
    };

    var descendant = req.param('descendant', -1);
    var level;

    if (descendant == -1) {
      level = 1;
    } else {
      data['articleId'] = 0;
      var parts = descendant.split('_');
      if (parts.length !== 2) {
        sails.log.error("wrong value of descendant");
        req.session.danger.push("Wrong request, please try again");
        return res.redirect(req.get('referrer') || '/');
      }
      descendant = parts[0];
      level = parts[1];
    }

    data['level'] = level;

    Comment.create(data, function (err, record) {
      if (err) {
        sails.log.error(err);
        return res.negotiate(err)
      }
      if (descendant == -1)
        descendant = record.id;


      Comment.query('INSERT INTO commentstreepath (ancestor, descendant, "level") SELECT ancestor, ' + record.id +
        ', "level" FROM commentstreepath WHERE descendant = ' + descendant + ' UNION ALL SELECT ' + record.id + ', ' + record.id + ', ' + level
        , function (err, data) {

          if (err) {
            sails.log.error(err);
            return res.negotiate(err)
          }


          req.session.flash.success.push("Comment added");
          return res.redirect(req.get('referrer') || '/');
        });
    })
  }
};
