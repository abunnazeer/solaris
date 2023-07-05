// const { promisify } = require('util');
// const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user/user.model');
const Profile = require('../models/user/profile.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');
const multer = require('multer');

const createSendToken = (user, _profile, statusCode, res, redirectUrl) => {
  user.password = undefined;

  res.status(statusCode).redirect(redirectUrl);
};

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

// getting user index
const getUserIndex = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters (default: page 1)
  const limit = 10; // Number of items per page
  const skip = (page - 1) * limit; // Calculate the number of items to skip

  const userCount = await User.countDocuments();
  const totalPages = Math.ceil(userCount / limit);

  const users = await User.find().skip(skip).limit(limit);
  const userProfiles = await Profile.find();

  const usersWithProfile = users.map(user => {
    const userProfile = userProfiles.find(
      profile => profile._id.toString() === user._id.toString()
    );
    if (userProfile) {
      return {
        _id: user._id,
        fullName: userProfile.fullName,
        profilePicture: userProfile.profilePicture,
        phoneNumber: userProfile.phoneNumber,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      };
    } else {
      return user;
    }
  });

  res.render('user/userindex', {
    title: 'Manage user',
    users: usersWithProfile,
    currentPage: page,
    totalPages: totalPages,
  });
});

// viewing user profile
const viewUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  try {
    const userProfile = await Profile.findById(id);
    const user = await User.findOne({ _id: id });

    if (!userProfile || !user) {
      // Handle case when user profile or user is not found
      return res.status(404).json({ message: 'User profile not found' });
    }

    const userWithProfile = {
      _id: user._id,
      fullName: userProfile.fullName,
      profilePicture: userProfile.profilePicture,
      phoneNumber: userProfile.phoneNumber,
      email: user.email,
      street: userProfile.address.street,
      state: userProfile.address.state,
      city: userProfile.address.city,
      zip: userProfile.address.zipCode,
      country: userProfile.address.country,
      role: user.role,
      isActive: user.isActive,
      referralCode: user.referralCode,
    };
    const protocol = req.protocol;
    const host = req.get('host');
    const url = `${protocol}://${host}/user/register`;
    res.status(200).render('user/updateprofile', {
      title: 'User Profile Detail',
      userProfile: userWithProfile,
      url,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to display user' });
  }
});

// Deleting user from the admin
const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndRemove(id);
    const deletedUserProfile = await Profile.findOneAndRemove({ _id: id });

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!deletedUserProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.json({ message: 'User and user profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user and user profile' });
  }
});

// updating user profile

const uploadPicture = upload.single('profilePicture');
const adminUpdateProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  try {
    // Retrieve the user profile data from the database based on the logged-in user
    const userProfile = await Profile.findOne({ _id: id });

    // Check if the user profile exists
    if (!userProfile) {
      return next(new AppError('User profile not found', 404));
    }

    // Retrieve the user details from the database based on the logged-in user
    const userDetails = await User.findOne({ _id: id });

    // Check if the user details exist
    if (!userDetails) {
      return next(new AppError('User not found', 404));
    }

    // Retrieve the updated profile data from the request body
    const {
      fullName,
      phoneNumber,
      street,
      city,
      state,
      country,
      zipCode,
      role,
    } = req.body;

    // Prepare an object to store the changed values
    const changedValues = {};

    // Compare and update the fields with the new values
    if (fullName !== userProfile.fullName) {
      userProfile.fullName = fullName;
      changedValues.fullName = {
        field: 'Full Name',
        value: fullName,
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

    if (role !== userDetails.role) {
      userDetails.role = role;
      changedValues.role = {
        field: 'Role',
        value: role,
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
      await userProfile.save({ validateBeforeSave: false });
      await userDetails.save({ validateBeforeSave: false });

      // Send email to the user
      const userMessage = `Dear ${userProfile.fullName},\n\nYour profile has been successfully updated.`;
      await sendEmail({
        email: userDetails.email, // Use the email field from the user details model
        subject: 'Profile Updated',
        message: userMessage,
        changedValues: Object.keys(changedValues),
      });

      // Send email to the admin
      const adminMessage = `User with email ${
        userDetails.email
      } has updated their profile.\n\nChanged values:\n${Object.entries(
        changedValues
      )
        .map(([key, value]) => `${value.field}: ${value.value}`)
        .join('\n')}`;
      await sendEmail({
        email: 'admin@solarisfinance.com', // Specify the admin's email address here
        subject: 'Profile Update Notification',
        message: adminMessage,
        changedValues: Object.keys(changedValues),
      });
    }

    // Redirect or render the appropriate response
    res.redirect(`/user/profile/${id}`);
  } catch (error) {
    console.error(error);
    next(new AppError('Internal Server Error', 500));
  }
});

// Rendering user registration form in the admin
const createUsersForm = (req, res) => {
  res.status(200).render('user/createuser', {
    title: 'Create user',
  });
};

// creating user from the admin
const createUsers = catchAsync(async (req, res, next) => {
  const { email, password, passwordConfirm, role } = req.body;
  const adminRole = req.user._id; // Retrieve the role from req.user

  // Validate password and password confirmation
  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match.', 400));
  }

  // Password validation: at least 8 characters, alphanumeric combination
  const isAlphanumeric = /^[0-9a-zA-Z]+$/;
  if (password.length < 8 || isAlphanumeric.test(password)) {
    return next(
      new AppError(
        'Password must be at least 8 characters long and contain only alphanumeric characters.',
        400
      )
    );
  }
  // Create a new user
  const newUser = await User.create({
    email,
    password,
    passwordConfirm,
    role,
  });

  // Create user profile while creating user
  const newProfile = await Profile.create({
    // Assigning user id to profile id
    _id: newUser._id,
    fullName: req.body.fullName,
    role: newUser.role,
  });

  const getUser = await User.findOne({ _id: adminRole });

  if (!getUser) {
    // Handle case when user profile or user is not found
    return res.status(404).json({ message: 'User profile not found' });
  }
  // i think the problem is from this section is the code is terminated before
  try {
    // Send email to the new user with the password
    const adminMessage = `Your account has been created by an admin. You can login with this password: ${password}`;
    await sendEmail({
      email,
      subject: 'Account Created by Admin',
      message: adminMessage,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    // Handle the error appropriately, e.g., return an error response
    return next(new AppError('Failed to send email.', 500));
  }

  console.log(getUser.role);

  const user = newUser;
  const profile = newProfile;
  const statusCode = 201;
  const redirectUrl = '/user/users';

  createSendToken(user, profile, statusCode, res, redirectUrl);
});

module.exports = {
  getUserIndex,
  viewUser,
  deleteUser,
  createUsersForm,
  createUsers,
  adminUpdateProfile,
  uploadPicture,
};
