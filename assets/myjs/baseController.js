/**
 * Created by Vladyslav on 26.10.2015.
 */

var showModalMessage = function(type, message) {
  $('.for-errors').html('<div class="alert alert-' + type + '">' + message
    + '</div>');
};
var removeModalMessage = function() {
  $('.for-errors').html(null)
};

var deleteTooltip = function (element) {
  try {
    $(element).tooltipster('destroy');
  } catch (e) {}
};

var getIds = function() {
  var rows = table.bootstrapTable('getSelections');
  if (rows.length === 0)
    return;

  var ids = [];
  for (var i = 0; i < rows.length; i++)
    ids.push(rows[i].id);
  return ids;
};
