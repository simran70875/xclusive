const mongoose = require("mongoose");

const BannerSchema = mongoose.Schema(
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
    Banner_Link: {
      type: String,
    },
    Banner_Sequence: {
      type: Number,
      default: 1,
    },
    CategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categorys",
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

module.exports = mongoose.model("Banners", BannerSchema);
