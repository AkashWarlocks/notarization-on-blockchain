const mongoose = require('mongoose');
const validator = require('validator');
const { ObjectId } = require('mongodb');

// User registration schema
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid');
        }
      },
    },
    documents: [
      {
        timestamp: {
          type: Number,
          required: true,
        },
        signedBy: {
          type: ObjectId,
          required: true,
        },
        transactionHash: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model('User', userSchema);
module.exports = User;
