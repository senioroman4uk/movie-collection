/**
 * Created by Vladyslav on 17.11.2015.
 */

$(document).ready(function () {
  var pager = new Pager({
    viewItems: 'contacts',
    itemName: 'contact',
    beforeItemInsert: function (item, index) {
      return item;
    }
  });

  //$('body a').click(pager.linkClickHandler);
  $(window).scroll(pager.scrollHandler);
});
