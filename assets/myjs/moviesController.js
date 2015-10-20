/**
 * Created by Vladyslav on 18.10.2015.
 */

var table = $('#movies');
var deleteTooltip = function (element) {
  try {
    $(element).tooltipster('destroy');
  } catch (e) {
  }
};

var errorCallback = function (row) {
  return function (xhr) {
    var tr = table.find('td:contains(' + row['id'] + ')').filter(function () {
      return $(this).text() == row['id'];
    }).parent();


    var message = '';
    try {
      message = xhr.responseJSON.Errors['name'][0];
    } catch (e) {
      message = 'Failed to update genre'
    }

    tr.tooltipster({
      content: message,
      position: 'right',
      trigger: 'custom'
    }).tooltipster('show');
  };
};
var saveHandler = function() {
  var formData = new FormData($('form')[0]); // Create an arbitrary FormData instance

  jQuery.ajax('/movies/update', {
    processData: false,
    contentType: false,
    data: formData,
    type: 'POST'
  });
};
var deleteHandler = function () {
  var elem = this;
  deleteTooltip(elem);

  var rows = table.bootstrapTable('getSelections');
  if (rows.length === 0)
    return;

  var ids = [];
  for (var i = 0; i < rows.length; i++)
    ids.push(rows[i].id);

  $.post('/genres/destroy', {ids: ids}, function (data) {
    var previous = table.bootstrapTable('getData');
    if (previous.length === data.length)
      table.bootstrapTable('prevPage');
    else
      table.bootstrapTable('refresh');
  }).fail(function () {
    $(elem).tooltipster({
      content: 'Deleting failed',
      position: 'left',
      trigger: 'custom'
    }).tooltipster('show');
  });
};

var showModal = function ($el, row) {
  try {
    var data = table.bootstrapTable('getData').filter(function (value) {return value.id === row.id})[0];

    for (var prop in data) {
      if (data.hasOwnProperty(prop) && !$.isArray(data[prop])) {
        var elem = $('#movieForm').find('[name="' + prop + '"]').not('[type="file"]');
        elem.val(data[prop]);
      }
    }
    $('#cover').attr('src', data.cover);
    $('#modal').modal('show');
  } catch (e) {
    console.log(e)
  }
};

$(document).ready(function () {
  table.on('dbl-click-row.bs.table', showModal);
  $('#save').click(saveHandler);
  $('#delete').click(deleteHandler);
});
