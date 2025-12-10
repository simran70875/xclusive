const mongoose = require('mongoose')

const NotificationSchema = mongoose.Schema({

    userId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }],
    userType: {
        type: String
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Orders"
    },
    title: {
        type: String,
    },
    message: {
        type: String,
    },
    type: {
        type: String,
        enum: ['0', '1', '2'],  // 0 = admin , 1 = for order time , 2 = notify 
    },
    sendFor: {
        type: String
        // 0 = all, 1 = all user , 2 = all reseller ,  3 = selected user , 4 = selected reseller
    },
    Notification_Image: {
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
},
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Notification', NotificationSchema)