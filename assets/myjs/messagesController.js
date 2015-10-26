/**
 * Created by Vladyslav on 26.10.2015.
 */

var table = $('#pages');
var updateAction = '/contact/update';
var destroyAction = '/contact/destroy';
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
actions.push({name: 'Answer selected', action: function() {
  var ids = getIds();
  if (ids.length === 0)
    return;
  $.post(updateAction, {id: ids, showInMenu: 1});
}});

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
