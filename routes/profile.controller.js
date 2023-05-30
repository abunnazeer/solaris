const mongoose = require('mongoose');
const Profile = require('../models/user/profile.model');
const catchAsync = require('../utils/catchAsync');

const updateProfile = catchAsync(async (req, res, next) => {
  const userProfile = await Profile.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  //   const token = signToken(newUser._id);
  res.status(201).json({
    status: 'User created successfully',
    // token,
    data: {
      userProfile,
    },
  });
});

module.exports = {
  updateProfile,
};
