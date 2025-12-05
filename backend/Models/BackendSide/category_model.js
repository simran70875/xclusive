const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema(
    {
        Category_Name: {
            type: String,
        },
        Category_Image: {
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
        Category_Sec_Image: {
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
        Category_Label: {
            type: String,
        },
        Category_Status: {
            type: Boolean,
            default: true,
        },
        Category_Feature: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Categorys', CategorySchema);
