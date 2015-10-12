/**
 * Created by Vladyslav on 12.09.2015.
 */
jQuery(document).ready(function () {
  jQuery('#subscribeForm').submit(onContactFormSubmit);

  function onContactFormSubmit(event) {
    event.preventDefault();
    var email = jQuery("[name='contactEmail']").val();
    if (!!email)
      jQuery.post('/subscribe', {email: email}, successCallback, 'json').fail(errorCallback);

    return false;
  }

  function successCallback() {
    showMessage('success', 'You have subscribed');
  }

  function errorCallback(xhr) {
    var message = '';
    try {
      message = xhr.responseJSON.invalidAttributes.email[0].message || 'Unknown error occurred';
    } catch(ex) {
      message = 'Unknown error occurred';
    }
    showMessage('danger', message)
  }

  function showMessage(type, message) {
    jQuery('#subscribeAlert').addClass('label-' + type).show('slow').text(message);
    setTimeout(function () {
      jQuery('#subscribeAlert').hide('slow').removeClass('label' + type).text('');
    }, 5000)
  }
});
