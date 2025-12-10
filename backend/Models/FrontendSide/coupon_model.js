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
    type: {
        type: String,
        enum: ['0', '1', '2'],
    },
    discountAmount: {
        type: Number,
    },
    coinsReward: {
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
    createFor: {
        type: {
            type: String,
            enum: ['0', '1', '2', '3', '4'],
        },
        id: {
            type: mongoose.Schema.Types.ObjectId,
        }
    },
    createdBy: {
        type: {
            type: String,
            enum: ['0', '1', '2'],
        },
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
        }
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
