const mongoose = require('mongoose');

// Variation Schema
const variationSchema = mongoose.Schema({
    Variation_Name: {
        type: String,
        required: true,
    },
    Variation_Images: [{
        filename: {
            type: String,
        },
        path: {
            type: String,
        },
        originalname: {
            type: String,
        },
    }],
    Variation_Size: [{
        Size_Name: {
            type: String,
        },
        Size_Stock: {
            type: Number
        },
        Size_Status: {
            type: Boolean,
            default: true
        },
    }],
    Variation_Label: {
        type: String
    },
    Variation_Status: {
        type: Boolean,
        default: true
    },
},
    {
        timestamps: true,
    }
);


// Product Schema
const productSchema = mongoose.Schema({
    Product_Name: {
        type: String,
    },
    SKU_Code: {
        type: String,
    },
    Category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categorys'
    }],
    Brand_Name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Data'
    },
    Fabric_Type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Data'
    },
    Occasions: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Data'
    },
    Product_Image: {
        filename: {
            type: String,
        },
        path: {
            type: String,
        },
        originalname: {
            type: String,
        },
    },
    Variation: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variations',
    }],
    Product_Dis_Price: {
        type: Number
    },
    Product_Ori_Price: {
        type: Number
    },
    Max_Dis_Price: {
        type: Number
    },
    Gold_Price: {
        type: Number
    },
    Silver_Price: {
        type: Number
    },
    PPO_Price: {
        type: Number
    },
    Description: {
        type: String,
    },
    Product_Label: {
        type: String,
    },
    Ready_to_wear: {
        type: Boolean,
        default: false
    },
    Trendy_collection: {
        type: Boolean,
        default: false
    },
    Popular_pick: {
        type: Boolean,
        default: false
    },
    HomePage: {
        type: Boolean,
        default: false
    },
    Product_Status: {
        type: Boolean,
        default: true
    },
    Shipping: {
        type: String,
        default: 'PRE LAUNCH'
    }
},
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Products', productSchema);
const Variation = mongoose.model('Variations', variationSchema);

module.exports = { Product, Variation };
