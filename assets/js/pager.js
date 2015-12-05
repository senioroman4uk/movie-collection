/**
 * Created by Vladyslav on 15.11.2015.
 */
//TODO: Refactor
function Pager(options) {
  var popped = ('state' in window.history) && window.history.state != null;
  var initialURL = location.href;

  var updateHistory = function (url) {
    var href = url || '';
    if (href === '') {
      if (location.href.split('?').length === 1)
        href = location.href + '?page=' + currentPage;
      else {
        var matches = location.href.match(pageRegex);
        if (matches)
          href = location.href.replace('page=' + matches[1], 'page=' + currentPage);
        else
          href = location.href + '&page=' + currentPage;
      }
    }

    history.pushState({href: href}, document.title, href);
  };
  window.history.replaceState({'href': initialURL}, document.title, window.location.href);

  $(window).bind("popstate", function (e) {
    //e.preventDefault();

    var initialPop = !popped && location.href == initialURL;
    popped = true;
    if (initialPop)
      return;

    currentXhr = $.ajax(e.originalEvent.state.href, historyAjaxOptions);
  });

  //$('.pagination').remove();

  var updateHeader = function updateHeader() {
    $.get('/header', function (html) {
      $('header').remove();
      $('#container').prepend(html);
    }, 'html');
  };

  var unbind = function () {
    $(window).unbind('scroll');
    $(window).unbind('popstate');
    $(document).off('click', 'a:not(.logoutButton)');
    $(document).off('click', 'a.logoutButton');
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
  //var itemsLocation = options.itemsLocation || location.href.replace(pageRegex, '');
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
  var redirectAjaxOptions = {
    dataType: 'json',
    data: {ajax: true},
    beforeSend: itemsAjaxOptions['beforeSend'],
    complete: itemsAjaxOptions['complete']
  };
  var historyAjaxOptions = {
    dataType: 'json',
    data: {ajax: true},
    beforeSend: itemsAjaxOptions['beforeSend'],
    complete: itemsAjaxOptions['complete'],
    success: function (data) {
      //removing old scroll handler
      unbind();
      //updateHistory(href);
      $('#content').html(data.html);
      document.title = data.title;
      $("html, body").animate({scrollTop: "0px"});
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
        //itemsAjaxOptions.data = {page: currentPage};
        //currentXhr = $.ajax(itemsLocation, itemsAjaxOptions);
      }
    },

    linkClickHandler: function (event) {
      if (this.href.match(/\/dashboard$/))
        return;

      event.preventDefault();

      if (currentXhr)
        currentXhr.abort();

      redirectAjaxOptions['success'] = function (href) {
        return function (data) {
          //removing old scroll handler
          unbind();
          updateHistory(href);
          $('#content').html(data.html);
          document.title = data.title;
          $("html, body").animate({scrollTop: "0px"});
        }
      }(this.href);
      currentXhr = $.ajax(this.href, redirectAjaxOptions);
    },

    logoutHandler: function (event) {
      event.preventDefault();
      var that = this;

      //TODO: Refactor
      if (currentXhr)
        currentXhr.abort();

      $.ajax(that.href, {
        dataType: 'json',
        type: 'GET',
        data: {isAjax: true},
        success: function (data) {
          unbind();

          document.title = data.title;
          history.pushState({}, document.title, '/');
          updateHeader();
          $('#content').html(data.html);
        },
        error: function (xhr) {
          $('.alert').remove();
          try {
            xhr.responseJSON.errors.forEach(function (error) {
              $(form).prepend('<div class="alert alert-danger">' + error + '</div>')
            });
          } catch (e) {
            $(form).prepend('<div class="alert alert-danger">Unknown error occurred</div>')
          }
        }
      });

    },

    unbind: unbind
  }
}
