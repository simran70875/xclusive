const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
    {
        User_Name: {
            type: String,
        },
        User_Image: {
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
        User_Email: {
            type: String,
        },
        User_Mobile_No: {
            type: Number
        },
        User_Password: {
            type: String,
        },
        User_Otp: {
            type: Number,
            default: 1234
        },
        Is_Verify: {
            type: Boolean,
            default: false
        },
        Wallet: {
            type: Number,
            default: 0
        },
        Coins: {
            type: Number,
            default: 0
        },
        User_Type: {
            type: String,
            default: "0"
        },
        Block: {
            type: Boolean,
            default: false
        },
        User_Label: {
            type: String,
        },
        User_Status: {
            type: Boolean,
            default: true,
        },
        Notification_Token: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Users', UserSchema);
