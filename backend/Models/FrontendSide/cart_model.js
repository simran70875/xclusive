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
    price: {
        type: Number
    },
    totalPrice: {
        type: Number
    },
    sizeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variations'
    },
    SizeName: {
        type: String
    },
    purity: {
        type: String   //9k, 18k etc.
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