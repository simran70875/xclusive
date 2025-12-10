const mongoose = require('mongoose');

// Define the Newsletter schema
const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    trim: true,
    default: null,
  },
  status: {
    type: String,
    enum: ['subscribed', 'unsubscribed'],
    default: 'subscribed',
  },
  subscribed_at: {
    type: Date,
    default: Date.now,
  }
});

// Create the model from the schema
const Newsletter = mongoose.model('Newsletter', newsletterSchema);

// Export the model
module.exports = Newsletter;
