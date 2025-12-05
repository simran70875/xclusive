const mongoose = require('mongoose');

const GeneralSettingSchema = mongoose.Schema({
    app_name: String,
    app_author: String,
    app_logo: {
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
    app_upi_image: {
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
    app_contact: String,
    app_email: String,
    app_website: String,
    app_description: String,
    app_developed_by: String,
    app_privacy_policy: String,
    app_shipping_policy: String,
    app_return_refund_policy: String,
    app_cod_policy: String,
    app_terms_condition: String,
    app_cancellation_refund: String,
    app_about_us: String,
    app_contact_us: String,
    app_faq: String,
    min_order: String,
    delivery_charge: String,
    min_delivery_free: String,
    onesignal_app_id: String,
    onesignal_rest_key: String,
    app_version: String,
    app_maintenance_status: {
        type: Boolean,
        default: false
    },
    app_maintenance_description: String,
    app_update_description: String,
    app_youtube_video: String,
    app_memberShip_video: String,
    app_update_cancel_button: {
        type: Boolean,
        default: false
    },
    factor_apikey: String,
    app_update_factor_button: {
        type: Boolean,
        default: false
    },
    firebase_server_key: String,
    razorpay_key: String,
    map_api_key: String,
    cash_on_delivery_available: String,
    coin_withdrawal_limit: Number,
    min_wallet_amount_limit: Number,
    price_convert_coin: Number,
    gst_charge: String,
    address: String,
    pan_no: String,
    gst_no: String,
    bank_name: String,
    account_no: String,
    ifsc_code: String,
    branch_name: String,
    review_reward_amount: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('GeneralSettings', GeneralSettingSchema);
