/**
 * Created by Vladyslav on 16.11.2015.
 */

$(document).ready(function () {
  var pager = new Pager({
    viewItems: 'actors',
    itemName: 'actor',
    beforeItemInsert: function (item, index) {
      return '<div class="row padding-top-15 padding-bottom-15 bottom-30' +
        (index % 2 != 0 ? ' delimiter' : ' white-row') + '">' + item + '</div>';
    }
  });

  //$('body a').click(pager.linkClickHandler);
  $(window).scroll(pager.scrollHandler);
});
