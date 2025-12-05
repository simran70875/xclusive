const express = require('express');
const route = express.Router();
const Notify = require('../../../Models/FrontendSide/notify_me_model');
const mongoose = require('mongoose');
const authMiddleWare = require('../../../Middleware/authMiddleWares')
const checkAdminRole = require('../../../Middleware/adminMiddleWares')
const checkAdminOrRole1 = require('../../../Middleware/checkAdminOrRole1')
const checkAdminOrRole2 = require('../../../Middleware/checkAdminOrRole2')
const checkAdminOrRole4 = require('../../../Middleware/checkAdminOrRole4')
const checkAdminOrRole5 = require('../../../Middleware/checkAdminOrRole5');
const { Variation } = require('../../../Models/BackendSide/product_model');

// add notify
route.post('/add', authMiddleWare, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId, variation, size } = req.body;

        // Check if a notification already exists for the same user and product
        const existingNotification = await Notify.findOne({
            userId: userId,
            product: productId,
        });

        if (existingNotification) {
            return res.status(200).json({ type: "error", message: "Your request is already on record." });
        }

        // Create a new notification
        const notification = new Notify({
            userId: userId,
            product: productId,
            variation: variation,
            size: size,
        });

        await notification.save();

        res.status(200).json({ type: "success", message: "We'll notify you as soon as the product is back in stock." });
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error.message });
        console.log(error);
    }
})


// get notify
route.get('/get', checkAdminOrRole2, async (req, res) => {
    try {

        const notifications = await Notify.find()
            .populate('product', 'Product_Name Product_Image')
            .populate('variation', 'Variation_Name Variation_Images')
            .populate('userId', 'User_Mobile_No User_Name')
            .sort({ createdAt: -1 })

        const result = notifications.map(notification => ({
            _id: notification._id,
            variation: notification.variation?.Variation_Name,
            size: notification.size,
            Product_Name: notification?.product?.Product_Name,
            Product_Image: `${process.env.IP_ADDRESS}/${notification?.variation?.Variation_Images[0]?.path?.replace(/\\/g, '/')}`,
            User_Name: notification?.userId?.User_Name,
            User_Mobile_No: notification?.userId?.User_Mobile_No,
        }));

        res.status(200).json({ type: "success", notifications: result });
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error.message });
        console.log(error);
    }
});


// Delete all notify product list
route.delete('/delete', checkAdminOrRole2, async (req, res) => {
    try {
        const notifyProducts = await Notify.find();
        await Notify.deleteMany();
        res.status(200).json({ type: "success", message: "All Notify Products deleted successfully!" });
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
        console.log(error)
    }
});


// Delete many notify Products
route.delete('/deletes', checkAdminOrRole2, async (req, res) => {
    try {
        const { ids } = req.body;
        const notifyProducts = await Notify.find({ _id: { $in: ids } });

        await Notify.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ type: "success", message: "All Notify Products deleted successfully!" });
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    }
});


// Delete notify Products by ID
route.delete('/delete/:id', checkAdminOrRole2, async (req, res) => {
    const notifyId = req.params.id;
    try {
        const notifyProducts = await Notify.findById(notifyId);
        if (!notifyProducts) {
            res.status(404).json({ type: "error", message: "Notify Products not found!" });
        } else {
            await Notify.findByIdAndDelete(notifyId);
            res.status(200).json({ type: "success", message: "Notify Products deleted successfully!" });
        }
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
        console.log(error)
    }
});


module.exports = route;
