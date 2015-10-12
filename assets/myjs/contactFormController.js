/**
 * Created by Vladyslav on 15.09.2015.
 */
jQuery(document).ready(function () {
  jQuery('#contactForm').submit(onContactFormSubmit);

  //submit handler
  function onContactFormSubmit(event) {
    event.preventDefault();
    try {
      $('#contactFormSubmit').tooltipster('destroy');
    } catch (e) {
    }
    var data = {};
    $('#contactForm').find('.form-control').each(function (index, element) {
      try {
        $(element).tooltipster('destroy');
      } catch (e) {}
      data[element.name] = $(element).val();
    });

    jQuery.post('/contacts', data, successCallback, 'json').fail(errorCallback);
    return false;
  }

  function successCallback(data) {
    showMessage('success', 'We will contact with you soon, ' + data.name, 'contactFormSubmit');
  }

  function errorCallback(xhr) {
    try {
      var errors = xhr.responseJSON.Errors;
      for (var name in errors)
        if (errors.hasOwnProperty(name)) {
          var message = errors[name][0].message;
          showMessage('danger', message, name);
        }
    } catch (ex) {
      message = 'Unknown error occurred';
      showMessage('danger', message, 'contactFormSubmit');
    }
  }

  function showMessage(type, message, name) {
    jQuery('#' + name).tooltipster({
      content: message,
      position: 'right',
      trigger: 'custom'
    }).tooltipster('show');
  }
});

//'<div role="tooltip" class="tooltip tooltip-danger fade righ"><div class="tooltip-arrow" style="top: 20.1754%;"></div><div class="tooltip-inner">Message is required</div></div>'
