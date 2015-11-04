/**
 * Created by Vladyslav on 14.09.2015.
 */

module.exports = {
  autoUpdatedAt: false,

  types: {
    isip: function(ip) {
      var result = true;
      var pattern = /^((\d){1,3}\.){3}(\d){1,3}$/;
      if (pattern.test(ip)) {
        var numbers = ip.split('.');
        for(var i = 0; i < 4; i++) {
          var value = Number(numbers[i]);
          if (value > 255 || value < 0) {
            result = false;
            break;
          }
        }
      }
      return result;
    }
  },

  attributes: {
    name: {
      type: 'string',
      required: true,
      maxLength: 255
    },
    email: {
      type: 'email',
      required: true,
      maxLength: 255
    },
    message: {
      type: 'string',
      required: true,
      minLength: 6,
      maxLength: 255
    },
    ip: {
      type: 'string',
      'isip': true,
      required: true
    },
    answer: {
      type: 'string'
    }
  },
  validationMessages: {
    email: {
      required: 'Email is required',
      email: 'Provide valid email address',
      maxLength: 'Too long value, maximum is 255'
    },
    name: {
      required: 'Name is required',
      maxLength: 'Too long value, maximum is 255'
    },
    message: {
      required: 'Message is required',
      minLength: 'Enter at least 6 symbols',
      maxLength: 'Too long value, maximum is 255'
    },
    ip: {
      'isip' : 'invalid ip format',
      required: 'ip address is required'
    },
  }
};
