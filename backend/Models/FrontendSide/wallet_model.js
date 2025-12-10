const mongoose = require("mongoose");

const WallteSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    paymentId: {
      type: String,
    },
    Amount: {
      type: Number,
    },
    Description: {
      type: String,
    },
    Trans_Type: {
      type: String,
      default: "Debit",
    },
    Type: {
      type: String,
      default: "0",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Wallte", WallteSchema);
