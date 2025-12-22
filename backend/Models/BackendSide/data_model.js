const mongoose = require('mongoose');

const DataSchema = mongoose.Schema(
  {
    Data_Type: {
      type: String,
      required: true
    },

    Data_Name: {
      type: String,
      trim: true
    },

    Data_Label: String,

    Data_Status: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Data', DataSchema);
