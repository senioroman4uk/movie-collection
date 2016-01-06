/**
 * Created by Vladyslav on 02.01.2016.
 * Functions for handling covers
 */

var path = require('path');
var fs = require('fs');

function deleteCover(dir, record, subdir) {
  return function (next) {
    var filePath = path.resolve(sails.config.appPath, dir + '/images/' + subdir + '/', record.cover);
    fs.exists(filePath, function (exists) {
      if (exists) {
        fs.unlink(filePath, next);
        return;
      }
      next();
    })
  }
}

module.exports = {
  completeDeleteCover: function (record, type, callback) {
    async.parallel([
      deleteCover('assets', record, type),
      deleteCover('.tmp/public', record, type)
    ], callback);
  },

  moveToAssets: function (type) {
    return function (record, cb) {
      var src = path.resolve(sails.config.appPath, '.tmp/public/images/' + type + '/' + record.cover);
      fs.exists(src, function (exists) {
        if (exists) {
          var rs = fs.createReadStream(src);
          var ws = fs.createWriteStream(path.resolve(sails.config.appPath, 'assets/images/' + type + '/' + record.cover));

          rs.on('error', cb);
          ws.on('close', cb);
          ws.on('error', cb);

          rs.pipe(ws);
          return;
        }

        sails.log.warn('file: ' + src + ' doesen\'t exist');
        cb();
      });
    }
  }
};
