const mongoose = require('mongoose')

const NotifySchema = mongoose.Schema({

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
    size: {
        type: String
    }
},
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Notify', NotifySchema)