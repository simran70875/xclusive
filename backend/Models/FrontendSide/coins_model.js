const mongoose = require('mongoose')

const CoinSchema = mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    Amount: {
        type: Number
    },
    Description: {
        type: String
    },
    Trans_Type: {
        type: String,
        default: "Debit"
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Orders"
    },
    Coupon: {
        type: String
    },
    Type: {
        type: String,
        default: "0"
    },
},
    {
        timestamps: true,
    }
)
module.exports = mongoose.model('Coins', CoinSchema)