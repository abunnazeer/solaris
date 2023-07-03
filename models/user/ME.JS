const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  _id: String,
  fullName: {
    type: String,
    required: [true, 'please provide your full name'],
  },
  profilePicture: {
    type: String,
    required: [true, 'please add profile photo'],
    default: '../../../images/avatar/avatar-13.png',
  },
  phoneNumber: {
    type: String,
    required: [true, 'please provide your phone number'],
    default: '0800000000000',
  },
  address: {
    street: { type: String, default: 'your street' },
    city: { type: String, default: 'your city' },
    state: { type: String, default: 'your state' },
    country: { type: String, default: 'your country' },
    zipCode: { type: String, default: 'your zip' },
  },
  role: {
    type: String,
  },
});

module.exports = mongoose.model('userProfile', userProfileSchema);
