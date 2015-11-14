/**
 * Created by Vladyslav on 26.09.2015.
 */

function formatDate(_date, withTime) {
  var month = _date.getMonth() + 1;
  var date = _date.getDate();
  var minutes = _date.getMinutes();

  date = date < 10 ? '0' + date : date;
  month = month < 10 ? '0' + month : month;
  minutes = minutes < 10 ? '0' + minutes : minutes;

  var result = date + '.' + month + '.' + _date.getFullYear();
  if (withTime)
    result += ' ' + _date.getHours() + ':' + minutes;

  return result;
}

jQuery(document).ready(function () {

  var page = 2;
  var ids = [];
  var defaultAddElement = function(element, amount) {
    jQuery('<div/>', {
      'class': 'row padding-top-15 padding-bottom-15 bottom-30 ' + (amount % 2 === 0 ? 'delimiter' : 'white-row'),
      'html': element.html
    }).insertBefore('#elements');
  };


  var inProcess = false;
  for (var i = 0; i < elements.length; i++)
    ids.push(elements[i].id)
  delete elements;

  var ajaxOptions = {
    dataType: 'json',
    beforeSend: function () {
      inProcess = true;
    },
    error: function () {
      inProcess = false;
    },
    data: {page: page},
    success: function (data) {

      if (data.length > 0) {
        page++;
        for (var i = 0; i < data.length; i++) {
          if (ids.indexOf(data[i].id) > -1)
            continue;
          ids.push(data[i].id);

          var addElement = typeof(_addElement)  !== 'undefined' ? _addElement : defaultAddElement;
          addElement(data[i], ids.length)
        }
      }
      inProcess = false;
    }
  };

  $(window).scroll(function () {
    if ($(window).height() + $(window).scrollTop() >= $(document).height() && !inProcess) {
      ajaxOptions.data.page = page;
      $.ajax($(window).location, ajaxOptions);
    }
  })
});
