const mongoose = require('mongoose');

const ChargesSchema = mongoose.Schema(
    {
        Normal_Ship_Charge: {
            type: Number,
            default: 0
        },
        Gold_Ship_Charge: {
            type: Number,
            default: 0
        },
        Silver_Ship_Charge: {
            type: Number,
            default: 0
        },
        PPO_Ship_Charge: {
            type: Number,
            default: 0
        },
        Normal_Coup_Disc: {
            type: Number,
            default: 0
        },
        Gold_Coup_Disc: {
            type: Number,
            default: 0
        },
        Silver_Coup_Disc: {
            type: Number,
            default: 0
        },
        PPO_Coup_Disc: {
            type: Number,
            default: 0
        },
        coins_reward_user: {
            type: Number,
            default: 1
        },
        coins_reward_gold: {
            type: Number,
            default: 1
        },
        coins_reward_silver: {
            type: Number,
            default: 1
        },
        coins_reward_ppo: {
            type: Number,
            default: 1
        },
        usage_limit_user: {
            type: Number,
            default: 1
        },
        usage_limit_reseller: {
            type: Number,
            default: 1
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Charges', ChargesSchema);
