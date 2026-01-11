const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    User_Name: {
      type: String,
    },
    User_Image: {
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
    User_Email: {
      type: String,
    },
    Company: {
      type: String,
    },
    User_Mobile_No: {
      type: Number,
    },
    User_Password: {
      type: String,
    },
    Block: {
      type: Boolean,
      default: false,
    },
    User_Label: {
      type: String,
    },
    User_Status: {
      type: Boolean,
      default: false,
    },
    Notification_Token: {
      type: String,
      default: "",
    },
    Admin_Remarks: {
      type: String,
      trim: true,
      default: "",
    },

    Admin_Remarks_At: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Users", UserSchema);
