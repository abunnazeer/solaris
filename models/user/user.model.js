// const crypto = require('crypto');
// const mongoose = require('mongoose');
// const validator = require('validator');
// const bcrypt = require('bcryptjs');
// const userSchema = new mongoose.Schema({
//   // name: {
//   //   type: String,
//   //   required: [true, 'Your full name'],
//   // },
//   email: {
//     type: String,
//     required: [true, 'please provide your email'],
//     unique: true,
//     lowercase: true,
//     validate: [validator.isEmail, 'please provide  a valid email'],
//   },

//   password: {
//     type: String,
//     required: [true, 'please provide a password'],
//     minlength: 8,
//     select: false,
//     validate: {
//       validator: function (el) {
//         // Alphanumeric password validation
//         return /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(el);
//       },
//       message: 'Password must contain at least one letter and one number.',
//     },
//   },
//   passwordConfirm: {
//     type: String,
//     required: [true, 'please confirm your password'],
//     validate: {
//       validator: function (el) {
//         return el === this.password;
//       },
//       message: 'passwords not match!',
//     },
//   },
//   role: {
//     type: String,
//     enum: ['user', 'Business', 'admin'],
//     default: 'user',
//   },
//   emailVerificationToken: String,
//   emailVerificationExpires: Date,
//   isActive: {
//     type: Boolean,
//     default: false,
//   },

//   passwordChangedAt: Date,
//   passwordResetToken: String,
//   passwordResetExpires: Date,
// });

// userSchema.pre('save', async function (next) {
//   // This function can only be run when the password is modified
//   if (!this.isModified('password')) return next();

//   // This hashing the password with cost of 12
//   this.password = await bcrypt.hash(this.password, 12);

//   // this delete the password confirm field
//   this.passwordConfirm = undefined;
//   next();
// });

// userSchema.methods.correctPassword = async function (
//   insertedPassword,
//   userPassword
// ) {
//   return await bcrypt.compare(insertedPassword, userPassword);
// };
// userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
//   if (this.passwordChangedAt) {
//     const changedTimestamp = parseInt(
//       this.passwordChangedAt.getTime() / 1000,
//       10
//     );
//     // console.log(changedTimestamp, JWTTimestamp);
//     return JWTTimestamp < changedTimestamp; // 100 < 200
//   }
//   return false;
// };
// userSchema.methods.createPasswordResetToken = function () {
//   const resetToken = crypto.randomBytes(32).toString('hex');
//   this.passwordResetToken = crypto
//     .createHash('sha256')
//     .update(resetToken)
//     .digest('hex');
//   // console.log({ resetToken }, this.passwordResetToken);
//   this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
//   return resetToken;
// };
// // Generate email verification token
// userSchema.methods.generateEmailVerificationToken = function () {
//   const verificationToken = crypto.randomBytes(32).toString('hex');
//   this.emailVerificationToken = crypto
//     .createHash('sha256')
//     .update(verificationToken)
//     .digest('hex');
//   this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // Token expires in 24 hours
//   return verificationToken;
// };
// module.exports = mongoose.model('User', userSchema);

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

module.exports = mongoose.model('User', userSchema);
