const mongoose = require('mongoose')

const BannerProductSchema = mongoose.Schema({

    Banner_Name: {
        type: String,
        required: true,
    },
    Banner_Image: {
        filename: {
            type: String,
        },
        path: {
            type: String,
        },
        originalname: {
            type: String
        }
    },
    Banner_Sequence: {
        type: Number,
        default: 1,
    },
    ProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products'
    },
    Banner_Label: {
        type: String
    },
    Banner_Status: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true,
    }

)

module.exports = mongoose.model('BannerforProduct', BannerProductSchema)