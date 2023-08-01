const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
    validate: {
      validator: function (value) {
        // Alphanumeric password validation
        return /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(value);
      },
      message: 'Password must contain at least one letter and one number.',
    },
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: 'Passwords do not match!',
    },
  },
  role: {
    type: String,
    enum: ['personal', 'business', 'admin'],
    default: 'personal',
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  isActive: {
    type: Boolean,
    default: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  referredMe: {
    type: String,
    lowercase: true,
  },
  twoFactorSecret: {
    type: String,
    select: true,
  },
  isTwoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  isTwoFactorSetupComplete: {
    type: Boolean,
    default: false,
  },
  referralCode: {
    type: String,
    minlength: 6,
    maxlength: 10,
    unique: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  downlines: [
    {
      level: {
        type: Number,
        required: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  ],
});

userSchema.pre('save', async function (next) {
  // Hash the password only if it is modified or new
  if (!this.isModified('password')) {
    return next();
  }

  // Hash the password with a cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Remove the password confirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  insertedPassword,
  userPassword
) {
  return await bcrypt.compare(insertedPassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
  return resetToken;
};

userSchema.methods.generateEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // Token expires in 24 hours
  return verificationToken;
};

userSchema.methods.generateReferralCode = function () {
  const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  this.referralCode = referralCode;
  return referralCode;
};

userSchema.methods.generateReferralEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // Token expires in 24 hours
  return verificationToken;
};

module.exports = mongoose.model('User', userSchema);
