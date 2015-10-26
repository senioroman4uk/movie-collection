/**
 * Created by Vladyslav on 23.10.2015.
 */

var table = $('#pages');
var updateAction = '/pages/update';
var createAction = '/pages/create';
var destroyAction = '/pages/destroy';
var actions = [];

actions.push({name: 'Delete selected', action: function() {
  var ids = getIds();
  if (ids.length === 0)
    return;

  $.post(destroyAction, {id: ids}, function (data) {
    var previous = table.bootstrapTable('getData');
    if (previous.length === data.length)
      table.bootstrapTable('prevPage');
    else
      table.bootstrapTable('refresh');
  });
}});
actions.push({name: 'Make visible', action: function() {
  var ids = getIds();
  if (ids.length === 0)
    return;
  $.post(updateAction, {id: ids, showInMenu: 1});
}});
actions.push({name: 'Make unvisible', action: function() {
  var ids = getIds();
  if (ids.length === 0)
    return;
  $.post(updateAction, {id: ids, showInMenu: 0});
}});
actions.push({name: 'Set admin access', action: function() {
  var ids = getIds();
  if (ids.length === 0)
    return;
  $.post(updateAction, {id: ids, access: 2});
}});
actions.push({name: 'Set public access', action: function() {
  var ids = getIds();
  if (ids.length === 0)
    return;
  $.post(updateAction, {id: ids, access: 0});
}});
actions.push({name: 'Set registered access', action: function() {
  var ids = getIds();
  if (ids.length === 0)
    return;
  $.post(updateAction, {id: ids, access: 1});
}});

var errorCallback = function (row, field) {
  return function (xhr) {
    var tr = table.find('td:contains(' + row['id'] + ')').filter(function () {
      return $(this).text() == row['id'];
    }).parent();

    var message = '';
    try {
      message = xhr.responseJSON.Errors[field][0].message;
    } catch (e) {
      message = 'Failed to update field'
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

  $.ajax($('#editForm').attr('action'), {
    processData: false,
    contentType: false,
    data: formData,
    type: 'POST',
    success: function(data) {
      $('.for-errors').text('Page was created successfully');
      table.bootstrapTable('refresh');
    }
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

  $.post(destroyAction, {ids: ids}, function (data) {
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
var addHandler = function() {
  $('.for-errors').text(null);
  deleteTooltip($('#modal').find('.form-control'));
  deleteTooltip($('#save'));
  showModal(null, null);
};

var showModal = function ($el, row) {
  try {
    if (row != null) {
      var data = table.bootstrapTable('getData').filter(function (value) {return value.id === row.id})[0];

      for (var prop in data) {
        if (data.hasOwnProperty(prop) ) {
          var elem = $('#editForm').find('[name="' + prop + '"]').not('[type="file"]');
          if (prop != 'access')
            elem.val(data[prop]);
          else
            elem.val(data[prop].id);
        }
      }
      $('#editForm').attr('action', updateAction);
    }
    else
      $('#editForm').attr('action', createAction);
    $('#modal').modal('show');
  } catch (e) {
    console.log(e)
  }
};
var clearModal = function() {
  deleteTooltip($('#modal').find('.form-control'));
  deleteTooltip($('#save'));
  $('#editForm').find('.form-control').val(null);
  $('.for-errors').text(null);
};

$(document).ready(function () {
  table.on('dbl-click-row.bs.table', showModal);
  table.on('editable-save.bs.table', function (el, field, row, oldValue) {
    table.find('tr').each(function (index, element) {
      deleteTooltip(element);
    });
    row.access = row.access.id;
    delete row['createdAt'];
    delete row['updatedAt'];
    delete row['state'];

    $.post(updateAction, row).fail(errorCallback(row, field));
  });
  $('#modal').on('hide.bs.modal', clearModal);
  $('#add').click(addHandler);
  $('#save').click(saveHandler);
  $('#delete').click(deleteHandler);
  $('#actions').append('<option value="-1">Select action</option>');
  actions.forEach(function(value, index) {
    $('#actions').append('<option value="' + index +'">' + value.name + '</option>');
  });

  $('#apply').click(function() {
    var actionId = $('#actions').val();
    if (actionId === '-1')
      return;
    actions[actionId].action.apply();
    table.bootstrapTable('refresh');
  })
});
