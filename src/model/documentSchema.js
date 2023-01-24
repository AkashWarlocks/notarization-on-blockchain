const mongoose = require('mongoose');

// Notarised Document schema
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
    timeElapsed: {
      type: Number,
      required: true,
    },
    provider: {
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
