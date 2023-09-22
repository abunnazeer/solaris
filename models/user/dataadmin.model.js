const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// Define the dataAdmin schema
const dataAdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true, // Removes whitespace at the beginning and end of the string
      lowercase: true, // Converts the email to lowercase
    },
    code: {
      type: String,
      required: true,
      trim: true, // Removes whitespace at the beginning and end of the string
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Compile the schema into a model and export it
module.exports = mongoose.model('DataAdmin', dataAdminSchema);
