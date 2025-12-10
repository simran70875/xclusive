const mongoose = require("mongoose");

const BannerPopUpSchema = mongoose.Schema(
  {
    Banner_Name: {
      type: String,
      required: true,
    },
    Banner_Image: {
      filename: {
        type: String,
      },
      path: {
        type: String,
      },
      originalname: {
        type: String,
      },
    },

    Banner_Label: {
      type: String,
    },
    Banner_Status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BannerforPopUp", BannerPopUpSchema);
