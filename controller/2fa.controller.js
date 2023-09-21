const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user/user.model');
const Profile = require('../models/user/profile.model');
const TwoFactor = require('../models/user/twoFactor.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { emailVerification } = require('../utils/message/email_verification');
//Function for JWT

const adminDisable2FA = async (req, res, next) => {
  try {
    // Extract userId from request parameters
    const { userId } = req.params;

    // Find user by ID and update
    const user = await User.findByIdAndUpdate(
      userId,
      {
        twoFactorSecret: undefined,
        isTwoFactorEnabled: false,
        isTwoFactorSetupComplete: false,
      },
      {
        new: true, // Return the updated user
        runValidators: true, // Run schema validations
      }
    );

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // Redirect the user to a relevant page (e.g., dashboard or profile)
    res.redirect('/user/users');
  } catch (err) {
    next(err);
  }
};

// Step 1: Generate the two-factor authentication (2FA) code and setup QR code for scanning
const generateTwoFaCode = catchAsync(async (req, res) => {
  try {
    // Generate a new secret key for the user
    const secret = speakeasy.generateSecret({ length: 20 });

    // Store the secret key in the user's account securely (this could be stored in the database)
    req.user.twoFactorSecret = secret.base32; // Secret should be stored securely, not in the user object
    req.user.isTwoFactorEnabled = true;

    // Generate and store recovery codes for the user
    const recoveryCodes = [];
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(3).toString('hex');
      recoveryCodes.push({ code });
    }
    req.user.recoveryCodes = recoveryCodes; // Store recovery codes for the user

    await req.user.save({ validateBeforeSave: false });
    const userId = req.user._id;
    const recoveryCode = await User.findOne({ _id: userId });
    const recoveryCoded = recoveryCode.recoveryCodes;

    // console.log('Generated secret key:', req.user.twoFactorSecret);

    // Generate the QR code for the user to scan with their authenticator app
    const otpAuthUrl = speakeasy.otpauthURL({
      secret: secret.ascii, // Use ASCII secret for the QR code
      label: `Solaris Finance:${req.user.email}`, // Replace with your app and user-specific data
      algorithm: 'sha1', // Use SHA1 algorithm for the QR code (compatible with most authenticator apps)
    });

    // Generate a data URL for the QR code image
    const qrCodeUrl = await qrcode.toDataURL(otpAuthUrl);

    // Render the authenticator_setup.ejs template and pass the qrCodeUrl variable
    return res.render('user/authenticatorsetup', {
      qrCodeUrl,
      recoveryCodes: recoveryCoded,
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return res.status(500).json({ error: 'QR code generation failed.' });
  }
});

const setupTwoFactor = catchAsync(async (req, res) => {
  try {
    const { twoFactorAuthCode } = req.body;

    if (!req.user || !req.user.twoFactorSecret) {
      console.error('Two-factor secret key not found for the user.');
      return res
        .status(500)
        .json({ error: 'Two-factor secret key not found.' });
    }

    const isTwoFactorCodeValid = speakeasy.totp.verify({
      secret: req.user.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorAuthCode,
      window: 1,
    });

    if (!isTwoFactorCodeValid) {
      console.log('Invalid 2FA Code');
      return res.status(401).json({ error: 'Invalid 2FA code.' });
    }

    req.user.isTwoFactorSetupComplete = true;
    await req.user.save({ validateBeforeSave: false });

    return res.redirect('/user/two-factor');
  } catch (err) {
    console.error('Error setting up 2FA:', err);
    return res.status(500).json({ error: '2FA setup failed.' });
  }
});

const disable2FA = async (req, res, next) => {
  try {
    const user = req.user; // Assuming you have the authenticated user in req.user
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    // Clear the 2FA secret for the user in the database
    user.twoFactorSecret = undefined;
    req.user.isTwoFactorEnabled = false;
    req.user.isTwoFactorSetupComplete = false;
    await user.save({ validateBeforeSave: false });

    // Redirect the user to a relevant page (e.g., dashboard or profile)
    res.redirect('/user/two-factor');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  adminDisable2FA,
  disable2FA,
  setupTwoFactor,
  generateTwoFaCode,
};
