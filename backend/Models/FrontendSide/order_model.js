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
    Shipping_Charge: {
      type: Number,
    },
    is_Shipping_ChargeAdd: {
      type: Boolean,
      default: false,
    },
    PaymentType: {
      type: String,
      default: "0",
    },
    PaymentId: {
      type: String,
      default: "0",
    },

    OrderType: {
      type: String,
      default: "1",
    },
    cod_advance_amt: {
      type: Number,
    },

    ActualPayment: {
      type: Number,
    },

    OriginalPrice: {
      type: Number,
      default: 0,
    },

    DiscountPrice: {
      type: Number,
      default: 0,
    },

    FinalPrice: {
      type: Number,
    },

    FinalAdavnceCodPrice: {
      type: Number,
    },

    processed: {
      type: Boolean,
      default: false,
    },

    reason: {
      type: String,
    },

    // for payment gateway
    tracking_id: {
      type: String,
    },

    bank_ref_no: {
      type: String,
    },

    order_status: {
      type: String,
    },

    payment_status: {
      type: String,
      default: "Unpaid",
    },

    cod_status: {
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
