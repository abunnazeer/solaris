const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  _id: String,
  firstName: {
    type: String,
    required: [true, 'please provide your first name'],
  },
  middleName: {
    type: String,
    required: [true, 'please provide your middle name'],
  },
  lastName: {
    type: String,
    required: [true, 'please provide your last name'],
  },
  gender: {
    type: String,
    required: [true, 'please specify your gender'],
    enum: ['male', 'female', 'other'], // Optional: restrict to specific values
  },
  profilePicture: {
    type: String,
    required: [true, 'please add profile photo'],
    default: '../../../images/avatar/avatar-13.png',
  },
  phoneNumber: {
    type: Number,
    required: [true, 'please provide your phone number'],
    default: 0800000000000,
  },
  address: {
    street: { type: String, default: 'your street' },
    city: { type: String, default: 'your city' },
    state: { type: String, default: 'your state' },
    country: { type: String, default: 'your country' },
    zipCode: { type: String, default: 'your zip' },
  },
  idCard: {
    cardNumber: {
      type: String,
      required: [true, 'please provide your ID card number'],
    },
    iDCardType: {
      type: String,
      required: [true, 'please specify the type of ID card'],
    },
    idCardImage: {
      type: String,
      required: [true, 'please upload an image of your ID card'],
    },
  },
  proofOfAddress: {
    proofType: {
      type: String,
      required: [true, 'please specify the type of proof'],
    },
    proofImage: {
      type: String,
      required: [true, 'please upload an image of your proof of address'],
    },
  },
  verification: {
    type: Boolean,
    default: false,
  },
  verificationFailed: {
    type: Boolean,
    default: false,
  },
  submittedDate: {
    type: String,
    required: true,
  },
  role: {
    type: String,
  },
});

module.exports = mongoose.model('userProfile', userProfileSchema);
