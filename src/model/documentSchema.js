const mongoose = require('mongoose');
const validator = require('validator');
const { ObjectId } = require('mongodb');

// User registration schema
const documentSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Number,
      required: true,
    },
    signedBy: {
      type: String,
      required: true,
    },
    transactionHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Document = mongoose.model('document', documentSchema);
module.exports = Document;
