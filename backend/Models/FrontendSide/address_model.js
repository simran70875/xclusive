const mongoose = require("mongoose");

const AddressSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    Type: {
      type: String,
    },
    Name: {
      type: String,
    },
    Phone_Number: {
      type: String,
    },
    House: {
      type: String,
    },
    landmark: {
      type: String,
    },
    Full_Address: {
      type: String,
    },
    Lat: {
      type: String,
    },
    Lng: {
      type: String,
    },
    State: {
      type: String,
    },
    City: {
      type: String,
    },
    Pincode: {
      type: Number,
    },
    Status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Address", AddressSchema);
