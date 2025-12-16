const mongoose = require("mongoose");

const OrderSchema = mongoose.Schema(
  {
    orderId: {
      type: String,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },

    Coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },

    CouponPrice: {
      type: Number,
      default: 0,
    },

    cartData: {
      type: Array,
    },

    Address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },

    //subtotal
    OriginalPrice: {
      type: Number,
      default: 0,
    },

    //discount
    DiscountPrice: {
      type: Number,
      default: 0,
    },

    //shipping charges
    Shipping_Charge: {
      type: Number,
    },

    is_Shipping_ChargeAdd: {
      type: Boolean,
      default: false,
    },

    //total price
    FinalPrice: {
      type: Number,
    },

    processed: {
      type: Boolean,
      default: false,
    },

    reason: {
      type: String,
    },

    order_status: {
      type: String,
    },

    payment_status: {
      type: String,
      default: "Unpaid",
    },
    payment_mode: {
      type: String,
    },

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Orders", OrderSchema);
