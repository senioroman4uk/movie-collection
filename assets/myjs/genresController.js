/**
 * Created by Vladyslav on 18.10.2015.
 */

var table = $('#genres');
var deleteTooltip = function(element) {
  try {
    $(element).tooltipster('destroy');
  } catch (e) {}
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
    if (previous.length === 0 || previous.length !== data.length)
      table.bootstrapTable('refresh');
    else
      table.bootstrapTable('prevPage');
  }).fail(function () {
    $(elem).tooltipster({
      content: 'Deleting failed',
      position: 'left',
      trigger: 'custom'
    }).tooltipster('show');
  });
};

var addHandler = function () {
  var elem = this;
  deleteTooltip(elem);
  var name = $.trim($('#genre').val());
  $.post('/genres/create', {name: name}, function(data) {
    $('#genre').val(null);
    table.bootstrapTable('refresh');
  }).fail(function () {
    $(elem).tooltipster({
      content: 'Adding failed',
      position: 'top',
      trigger: 'custom'
    }).tooltipster('show');
  });
};


$(document).ready(function () {
  table.on('editable-save.bs.table', function (el, field, row, oldValue) {
    table.find('tr').each(function (index, element) {
      deleteTooltip(element);
    });

    delete row['state'];
    $.post('/genres/update', row).fail(errorCallback(row));
  });

  $('#delete').click(deleteHandler);
  $('#add').click(addHandler);
});
