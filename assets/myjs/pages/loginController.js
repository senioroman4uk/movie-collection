/**
 * Created by Vladyslav on 18.11.2015.
 */

$(document).ready(function () {
  var pager = new Pager();
  $(document).on('click', 'a:not(.logoutButton)', pager.linkClickHandler);
  $(document).on('click', 'a.logoutButton', pager.logoutHandler);

  function updateHeader() {
    $.get('/header', 'html', function (html) {
      $('header').remove();
      $('#container').prepend(html);
    })
  }

  var form = document.forms.activityForm;
  $(form).submit(function (event) {
    event.preventDefault();
    $.ajax(form.action, {
      dataType: 'json',
      type: 'POST',
      data: $(form).serialize(),
      success: function (data) {
        document.title = data.title;
        history.pushState({}, document.title, '/');
        updateHeader();
        pager.unbind();
        $('#content').html(data.html);
      },
      error: function (xhr) {
        $('.alert').remove();
        try {
          xhr.responseJSON.errors.forEach(function (error) {
            $(form).prepend('<div class="alert alert-danger">' + error + '</div>')
          });
        } catch (e) {
          $(form).prepend('<div class="alert alert-danger">Unknown error occurred</div>')
        }
      }
    })
  })
});
