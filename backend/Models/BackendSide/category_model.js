const mongoose = require("mongoose");

const CategorySchema = mongoose.Schema(
  {
    Category_Name: {
      type: String,
      required: true,
      trim: true
    },

    Parent_Category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categories",
      default: null
    },

    Category_Image: {
      filename: String,
      path: String,
      originalname: String
    },

    Category_Sec_Image: {
      filename: String,
      path: String,
      originalname: String
    },

    Category_Label: String,

    Category_Status: {
      type: Boolean,
      default: true
    },

    Category_Feature: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Categories", CategorySchema);
