const multer = require('multer');
const Profile = require('../models/user/profile.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/profile');
  },
  filename: (req, file, cb) => {
    const randomNumber = Math.random().toString();
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${randomNumber}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image, please upload an image', 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: multerFilter,
});

const uploadProfilePhoto = upload.single('profilePicture');

const updateProfile = catchAsync(async (req, res, next) => {
  // Check if the user is authenticated
  if (!req.user) {
    return next(new AppError('Unauthorized', 401));
  }

  try {
    // Retrieve the user profile data from the database based on the logged-in user
    const userProfile = await Profile.findOne({ _id: req.user._id });

    // Check if the user profile exists
    if (!userProfile) {
      return next(new AppError('User profile not found', 404));
    }

    // Retrieve the updated profile data from the request body
    const {
      firstName,
      middleName,
      lastName,
      phoneNumber,
      street,
      city,
      state,
      country,
      zipCode,
    } = req.body;

    // Prepare an object to store the changed values
    const changedValues = {};

    // Compare and update the fields with the new values

    if (firstName !== userProfile.firstName) {
      userProfile.firstName = firstName;
      changedValues.firstName = {
        field: 'First Name',
        value: firstName,
      };
    }
    if (middleName !== userProfile.middleName) {
      userProfile.middleName = middleName;
      changedValues.middleName = {
        field: 'Middle Name',
        value: middleName,
      };
    }
    if (lastName !== userProfile.lastName) {
      userProfile.lastName = lastName;
      changedValues.lastName = {
        field: 'Last Name',
        value: lastName,
      };
    }
    if (phoneNumber !== userProfile.phoneNumber) {
      userProfile.phoneNumber = phoneNumber;
      changedValues.phoneNumber = {
        field: 'Phone Number',
        value: phoneNumber,
      };
    }

    if (street !== userProfile.address.street) {
      userProfile.address.street = street;
      changedValues.street = {
        field: 'Street',
        value: street,
      };
    }

    if (city !== userProfile.address.city) {
      userProfile.address.city = city;
      changedValues.city = {
        field: 'City',
        value: city,
      };
    }

    if (state !== userProfile.address.state) {
      userProfile.address.state = state;
      changedValues.state = {
        field: 'State',
        value: state,
      };
    }

    if (country !== userProfile.address.country) {
      userProfile.address.country = country;
      changedValues.country = {
        field: 'Country',
        value: country,
      };
    }

    if (zipCode !== userProfile.address.zipCode) {
      userProfile.address.zipCode = zipCode;
      changedValues.zipCode = {
        field: 'Zip Code',
        value: zipCode,
      };
    }

    // Check if a new profile picture is uploaded
    if (req.file) {
      // Store the profile picture in the specified directory
      userProfile.profilePicture = req.file.filename;
      changedValues.profilePicture = {
        field: 'Profile Picture',
        value: req.file.filename,
      };
    }

    // Check if any values have changed
    if (Object.keys(changedValues).length > 0) {
      // Save the updated profile
      const updatedProfile = await userProfile.save();

      // Send email to the user
      const userMessage = `Dear ${userProfile.firstName},\n\nYour profile has been successfully updated.`;
      await sendEmail({
        email: req.user.email, // Assuming you have an email field in the user profile model
        subject: 'Profile Updated',
        message: userMessage,
        changedValues: changedValues.field,
      });

      // Send email to the admin
      const adminMessage = `User with email ${
        req.user.email
      } has updated their profile.\n\nChanged values:\n${Object.entries(
        changedValues
      )
        .map(([key, value]) => `${value.field}: ${value.value}`)
        .join('\n')}`;
      await sendEmail({
        email: 'admin@solarisfinance.com', // Specify the admin's email address here
        subject: 'Profile Update Notification',
        message: adminMessage,
        changedValues: changedValues.field,
      });
    }

    // Redirect or render the appropriate response
    res.redirect('/user/profile');
  } catch (error) {
    console.error(error);
    next(new AppError('Internal Server Error', 500));
  }
});

module.exports = { updateProfile, uploadProfilePhoto };
