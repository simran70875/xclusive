const mongoose = require('mongoose')

const CartSchema = mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products'
    },
    variation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variations'
    },
    discountPrice: {
        type: Number
    },
    originalPrice: {
        type: Number
    },
    SizeName: {
        type: String
    },
    Quantity: {
        type: Number
    },
},
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Cart', CartSchema)