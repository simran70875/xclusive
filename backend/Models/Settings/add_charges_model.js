const mongoose = require('mongoose');

const ChargesSchema = mongoose.Schema(
    {
        Normal_Ship_Charge: {
            type: Number,
            default: 0
        },
        Normal_Coup_Disc: {
            type: Number,
            default: 0
        },
        coins_reward_user: {
            type: Number,
            default: 1
        },
        usage_limit_user: {
            type: Number,
            default: 1
        },

    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Charges', ChargesSchema);
