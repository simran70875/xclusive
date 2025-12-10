const mongoose = require("mongoose");

// MemberShip Schema
const MemberShipSchema = mongoose.Schema(
  {
    MemberShip_Name: {
      type: String,
      required: true,
    },
    MemberShip_Price: {
      type: Number,
      required: true,
    },
    Sort_Desc: {
      type: String,
    },
    Long_Desc: {
      type: String,
    },
    Validity: {
      type: String,
      default: "6 Months",
    },
    Type: {
      type: String,
      default: "1",
    },
    MemberShip_Status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MemberShips", MemberShipSchema);
