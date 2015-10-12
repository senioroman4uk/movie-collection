/**
 * Created by Vladyslav on 14.09.2015.
 */

module.exports = {
  autoUpdatedAt: false,
  attributes: {
    email: {
      type: 'email',
      required: true,
      unique: true
    }
  }
};
