/**
 * Created by Vladyslav on 15.11.2015.
 */
function Pager(options) {
  $('.pagination').remove();
  var updateHistory = function () {
    var href = '';
    if (location.href.split('?').length === 1)
      href = location.href + '?page=' + currentPage;
    else {
      var matches = location.href.match(pageRegex);
      if (matches)
        href = location.href.replace('page=' + matches[1], 'page=' + currentPage);
      else
        href = location.href + '&page=' + currentPage;
    }
    history.pushState({}, document.title, href);
  };

  options = options || {};
  var pageRegex = /[?&]page=([^&]+)/;

  var existingIds = options.ids || [];
  var urlPage = location.href.match(pageRegex);
  urlPage = urlPage != null ? parseInt(urlPage[1]) + 1 : false;
  var currentPage = options.currentPage || urlPage || 2;
  var inProcess = false;
  var itemName = options.itemName || 'item';
  var items = options.viewItems || itemName + 's';
  var itemContainer = options.itemContainer || 'div.row';
  //var itemsLocation = options.itemsLocation || (location.protocol + '//' + location.host + location.pathname);
  var itemsLocation = options.itemsLocation || location.href.replace(pageRegex, '');
  var currentXhr = null;
  var beforeItemInsert = options.beforeItemInsert;
  var itemsAjaxOptions = options.ajaxOptions || {
      dataType: 'json',
      beforeSend: function () {
        inProcess = true;
      },

      complete: function () {
        inProcess = false;
        currentXhr = null;
      },

      success: function (data) {
        if (data[items].length == 0)
          return;

        updateHistory();

        currentPage++;

        var offset = existingIds.length;
        var currentItems = [];
        data[items].forEach(function (item) {
          if (existingIds.indexOf(item.id) > -1)
            return;
          currentItems.push(item);
          existingIds.push(item.id);
        });

        var options = {_moment: moment};
        currentItems.forEach(function (item, index) {
          options[itemName] = item;
          $('#' + items).append(
            beforeItemInsert(ejs.render(data.template, options),
              offset + index));
        });

      }
    };


  //Adding existing ids
  $('#' + items).children(itemContainer).each(function () {
    var currentId = parseInt($(this).attr('data-id'));
    if (existingIds.indexOf(currentId) < 0)
      existingIds.push(currentId);
  });

  return {
    scrollHandler: function () {
      if ($(window).height() + $(window).scrollTop() >= $(document).height() && !inProcess) {
        itemsAjaxOptions.data = {page: currentPage};
        currentXhr = $.ajax(itemsLocation, itemsAjaxOptions);
      }
    },

    linkClickHandler: function (event) {
      event.preventDefault();
      if ($(this).href === '#')
        return;

    }
  }
}
