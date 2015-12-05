/**
 * Created by Vladyslav on 18.11.2015.
 */

$(document).ready(function () {
  var pager = new Pager();

  $(document).on('click', 'a:not(.logoutButton)', pager.linkClickHandler);
  $(document).on('click', 'a.logoutButton', pager.logoutHandler);
});
