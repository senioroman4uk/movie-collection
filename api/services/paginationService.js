/**
 * Created by Vladyslav on 15.11.2015.
 */

var async = require('async');

function paginate(page, limit, count) {
  count = Math.ceil(count / limit);
  var n = Math.min(Math.max(Math.min(page + 5, count), limit), count);
  var i = Math.max(Math.min(Math.max(page - 5, 0), n - limit), 0);

  return [n, i, count];
}
module.exports = {paginate: paginate};
