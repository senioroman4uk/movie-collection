/**
 * Created by Vladyslav on 26.10.2015.
 */
var table = $('#actors');
var editForm = $('#editForm');
var updateAction = '/actors/update';
var createAction = '/actors/create';

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
  jQuery.ajax(editForm.attr('action'), {
    processData: false,
    contentType: false,
    data: formData,
    type: 'POST',
    success: function(data) {
      table.bootstrapTable('refresh');
      $('#cover').attr('src', '/images/actors/' + (data.length > 0 ? data[0].cover : data.cover));
      showModalMessage('success', 'Saved successfully')
    },
    error: function() {
      showModalMessage('danger', 'Saving failed')
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

  $.post('/actors/destroy', {id: ids}, function (data) {
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
  showModal(null, null);
};

var showModal = function ($el, row) {
  try {
    if (row != null) {
      var data = table.bootstrapTable('getData').filter(function (value) {return value.id === row.id})[0];
      for (var prop in data) {
        if (data.hasOwnProperty(prop) && !$.isArray(data[prop])) {
          var elem = editForm.find('[name="' + prop + '"]').not('[type="file"]');
          elem.val(data[prop]);
        }
      }

      $('#cover').attr('src',  '/images/actors/' + data.cover);
      editForm.attr('action', updateAction);
      $('[name="movies"]').find('option').remove();

      var selected = [];
      data.movies.forEach(function(element) {
        selected.push(element.id);
        $('[name="movies"]').append('<option value="' + element.id + '">' + element.name
          + '</option>')
      });
      $('[name="movies"]').val(selected).trigger("change");
    }
    else {
      $('[name="movies"]').val([]).trigger("change");
      editForm.attr('action', createAction);
    }
    $('#modal').modal('show');
  } catch (e) {
    console.log(e)
  }
};
var clearModal = function() {
  editForm.find('.form-control').not('[type="file"]').val(null);
  $('#cover').attr('src', null);
  removeModalMessage();
  $('[name="cover"]').val(null);
};

$(document).ready(function () {
  table.on('dbl-click-row.bs.table', showModal);
  table.on('editable-save.bs.table', function (el, field, row, oldValue) {
    table.find('tr').each(function (index, element) {
      deleteTooltip(element);
    });

    delete row['state'];

    $.post(updateAction, row).fail(errorCallback(row, field));
  });
  $('#modal').on('hide.bs.modal', clearModal);
  $('#add').click(addHandler);
  $('#save').click(saveHandler);
  $('#delete').click(deleteHandler);
  $('[name="movies"]').select2({
    ajax: {
      url: "/dashboard/movies/select",
      cache: "true",
      dataType: 'json',
      width: 'resolve'
    }
  });
});
