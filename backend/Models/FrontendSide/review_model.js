const mongoose = require('mongoose')

const ReviewSchema = mongoose.Schema({

    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Orders"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    rating: {
        type: String,
        default: "0"
    },
    text: {
        type: String,
    },
    comment: {
        type: String,
        default: "0"
    },
    status: {
        type: Boolean,
        default: false
    },
    productIds: []
},
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('reviews', ReviewSchema)