const mongoose = require("mongoose");

// MemberShip Schema
const MemberShipHistorySchema = mongoose.Schema(
  {
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    PaymentId: {
      type: String,
    },
    Payment_Status: {
      type: String,
      enum:["Paid","Unpaid"]
    },
    Certificate: {
      type: Boolean,
      default: true,
    },
    Full_Address: {
      type: String,
    },
    Firm_Name: {
      type: String,
    },
    No_Order: {
      type: String,
    },
    Gst_No: {
      type: String,
    },
    MemberShipData: {
      type: Array,
    },
    Type: {
      type: String,
      default: "1",
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    // MemberShip_Status: {
    //     type: Boolean,
    //     default: false
    // },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MemberShipHistorys", MemberShipHistorySchema);
