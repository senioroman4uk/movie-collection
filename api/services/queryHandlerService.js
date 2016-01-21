/**
 * queryHandlerService.js
 * Created by Vladyslav on 19.11.2015.
 * Callbacks for db queries in Actor and Movie controllers
 */

var xml = require('xml-writer');
var fs = require('fs');
var async = require('async');

var findOneHandler = function (req, res, itemName) {
  return function (error, item) {
    if (error)
      return res.serverError(error);
    else if (!!item === false)
      return res.notFound();
    else {
      var page = req.param('page');
      var limit = req.param('limit');
      var context = this;

      Comment.find({
        articleType: itemName,
        articleId: item.id
      }).populate('author').paginate(page, limit).exec(function (err, comments) {
          if (err) {
            sails.log.error(err);
            comments = [];
          }

          context.comments = _.cloneDeep(comments);

          var jobs = [
            function (next) {
              async.map(comments, function (comment, nextComment) {
                var sql = 'SELECT c.id ' +
                  'FROM comment c ' +
                  'JOIN commentstreepath tp on (c.id = tp.descendant AND c."articleId" = 0) ' +
                  'WHERE tp.ancestor = ' + comment.id + ' ORDER BY c.level';

                Comment.query(sql, nextComment);
              }, next);
            },

            function (resultsOfQueries, next) {
              async.map(resultsOfQueries, function (queryResult, nextComment) {
                var ids = [];

                queryResult.rows.forEach(function (value) {
                  ids.push(value.id);
                });

                return nextComment(null, ids);
              }, next);
            },

            function (resultIds, next) {
              async.map(resultIds, function (ids, cb) {
                Comment.find(ids).populate('author').sort('level asc').exec(cb);
              }, next)
            }

          ];

          async.waterfall(jobs, function (err, children) {
            if (err) {
              sails.log.error(err);
              return res.negotiate(err);
            }

            children.forEach(function (subComments, index) {
              context.comments[index].children = subComments;
            });

            var type = req.accepts(['html', 'xml', 'json']);
            var data = {comments: context.comments, articleName: itemName};

            switch (type) {
              case 'html' :
                data = _.extend(data, {title: item.getName(), hideReadMore: true, _moment: sails.moment});
                data[itemName] = item;
                return res.view(itemName + '/findone', data);
                break;
              case 'json' :
                data = {title: item.getName(), hideReadMore: true, _moment: sails.moment, layout: null};
                data[itemName] = item;
                sails.hooks.views.render(itemName + '/findone', data, function (error, html) {
                  if (error)
                    return res.serverError(error);
                  return res.json(200, {title: utilService.makeTitle(item.getName()), html: html})
                });
                break;
              case 'xml':
                var xw = new xml().startDocument();
                xw = itemToXml(item, xw, itemName);
                xw = xw.endElement(itemName).endDocument();
                res.set('Content-Type', 'application/xml');
                return res.send(200, xw.toString());
                break;
              default :
                return res.badRequest();
                break;
            }
          });
        }
      );
      }
    }
};

//TODO: rethink whereKeys
var findHandler = function (req, res, limit, page, where, itemName, itemsName, whereKeys) {
  return function (error, data) {
    var items = data[0];
    var count = data[1];

    if (error)
      return res.serverError(error);
    else if (items.length === 0)
      return res.notFound();
    else {
      var nums = paginationService.paginate(page, limit, count);
      var link = '/' + itemsName + '?';
      whereKeys.every(function (key) {
        if (!!where[key] === true) {
          link += key + '=' + where[key] + '&';
          return false;
        }

        return true;
      });
      link += 'page';

      //detecting type of response that was preferred
      var type = req.accepts(['html', 'xml', 'json']);
      data = {
        title: itemsName.charAt(0).toUpperCase() + itemsName.slice(1),
        _page: page,
        _limit: limit,
        _n: nums[0],
        _i: nums[1],
        _count: nums[2],
        _link: link,
        _moment: sails.moment
      };

      data[itemsName] = items;
      switch (type) {
        case 'html' :
          //returning plain view
          return res.view(data);
          break;
        case 'xml' :
          //starting xml document
          var xw = new xml().startDocument().startElement(itemsName);

          //processing each record from database
          items.forEach(function (item) {
            xw = itemToXml(item, xw, itemName);
          });

          //finishing xml document
          xw = xw.endElement(itemsName).endDocument();

          //setting Content-Type
          res.set('Content-Type', 'application/xml');
          return res.send(200, xw.toString());
          break;
        case 'json' :
          if (req.param('ajax')) {
            data['layout'] = null;
            data['flash'] = res.locals.flash;
            sails.hooks.views.render(itemName + '/find', data, function (error, html) {
              if (error)
                return res.serverError(error);
              return res.json(200, {
                title: utilService.makeTitle(itemsName.charAt(0).toUpperCase() + itemsName.slice(1)),
                html: html
              })
            });
          }
          else {
            fs.readFile('views/partials/' + itemName + '.ejs', 'utf8', function (error, template) {
              if (error)
                return res.serverError(error);
              var responseData = {
                title: utilService.makeTitle(itemsName.charAt(0).toUpperCase() + itemsName.slice(1)),
                template: template
              };
              responseData[itemsName] = items;
              return res.json(responseData);
            });
          }
          break;
        default :
          return res.badRequest();
          break;
      }
    }
  }
};

var itemToXml = function (item, xw, itemName) {
  item = _.clone(item);
  xw = xw.startElement(itemName);

  for (var key in item) {
    if (!item.hasOwnProperty(key))
      continue;

    if (Array.isArray(item[key])) {
      if (item[key].length > 0) {
        xw = xw.startElement(key);
        item[key].forEach(function (subItem) {
          //TODO: handle pluralization
          xw = itemToXml(subItem, xw, key.substring(0, key.length - 1));
        });
        xw = xw.endElement(key);
      }
      continue;
    }
    else if (item[key] instanceof Object)
      item[key] = item[key].toString();
    xw = xw.startElement(key).text(item[key]).endElement(key);
  }

  xw = xw.endElement(itemName);
  return xw;
};

module.exports = {findOne: findOneHandler, find: findHandler};
