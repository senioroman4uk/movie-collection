/**
 * Created by Vladyslav on 18.10.2015.
 */

module.exports = {
  update: function(req, res) {
    var id = req.param('id');
    var name = req.param('name');

    Genre.update(id, {name: name}, function(error, data) {
      if (error)
        return res.badRequest();
      else if (!!data === false)
        return res.notFound();
      else
        return res.json(data);
    });
  },

  destroy: function(req, res) {
    var ids = req.param('ids');

    for (var i = 0; i < ids.length; i++)
      if (isNaN(parseFloat(ids[i])) || !isFinite(ids[i]))
        return res.badRequest();

    Genre.destroy(ids, function(error, data) {
      if (error)
        return res.badRequest();
      else
        return res.json(data);
    });
  },

  create: function(req, res) {
    var name = req.param('name');
    Genre.create({name: name}, function(error, data) {
      if (error)
        return res.json(400, error);
      return res.json(data);
    })
  }
    };
