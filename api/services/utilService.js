/**
 * Created by Vladyslav on 13.09.2015.
 */


module.exports = {
  makeTitle: function (page) {
    var title = 'Your movie collection';
    return !!page ? title + ' - ' + page : title;
  },

  formatDate: function (_date, withTime) {
    var month = _date.getMonth() + 1;
    var date = _date.getDate();
    var minutes = _date.getMinutes();

    date = date < 10 ? '0' + date : date;
    month = month < 10 ? '0' + month : month;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    var result = date + '.' + month + '.' + _date.getFullYear();
    if (withTime)
      result += ' ' + _date.getHours() + ':' + minutes;

    return result;
  }
};
