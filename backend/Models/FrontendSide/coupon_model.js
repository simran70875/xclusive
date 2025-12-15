const mongoose = require('mongoose');

const UserCouponUsageSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
    },
    usageCount: {
        type: Number,
        default: 0
    },
});

const CouponSchema = mongoose.Schema({
    couponCode: {
        type: String,
        unique: true
    },
    discountAmount: {
        type: Number,
    },
    creationDate: {
        type: Date,
    },
    expiryDate: {
        type: Date
    },
    status: {
        type: Boolean,
        enum: [true, false],
        default: true
    },
    usageLimits: {
        type: Number,
        default: 1
    },
    UserCouponUsage: [UserCouponUsageSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Coupon', CouponSchema);
