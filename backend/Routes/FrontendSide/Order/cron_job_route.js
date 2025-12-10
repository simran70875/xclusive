const express = require('express');
const route = express.Router();
const Order = require('../../../Models/FrontendSide/order_model');
const User = require('../../../Models/FrontendSide/user_model');
const Coins = require('../../../Models/FrontendSide/coins_model');
const cron = require('node-cron');

const authMiddleware = require('../../../Middleware/authMiddleWares');

// Schedule a cron job to run every day at 6 PM (18:00)
// cron.schedule('0 18 * * *', async () => {
//     try {
//         const currentDate = new Date();

//         // Calculate the date 7 days before the current date
//         const sevenDaysAgo = new Date();
//         sevenDaysAgo.setDate(currentDate.getDate() - 7);

//         // Find orders with OrderType 5, createdAt 7 days before the current date,
//         // and processed is false
//         const ordersToProcess = await Order.find({
//             OrderType: '5',
//             createdAt: { $lte: sevenDaysAgo },
//             processed: false,
//         });

//         if (ordersToProcess.length > 0) {
//             console.log('Orders to process:');
//             for (const order of ordersToProcess) {
//                 await processOrderResponse(order._id);
//                 order.processed = true;
//                 await order.save();
//             }
//         } else {
//             console.log('No orders to process.');
//         }
//     } catch (error) {
//         console.error('Error processing orders:', error);
//     }
// });

// const processOrderResponse = async (orderId) => {
//     try {
//         const order = await Order.findById(orderId)
//             .populate('cartData.product', 'Product_Name')
//             .populate('userId', 'User_Name User_Mobile_No')
//             .populate('Coupon')
//             .sort({ createdAt: -1 });

//         if (order.Coupon && order.Coupon.createdBy && order.Coupon.createdBy.id) {
//             const userId = order.Coupon.createdBy.id;
//             const coinsReward = order.Coupon.coinsReward;
//             const couponCode = order.Coupon.couponCode;
//             const orderId = order._id;
//             const showOrderId = order.orderId;
//             const user = await User.findById(userId);
//             const userName = user?.User_Name;

//             // Calculate the amount based on coinsReward and cartData
//             const amount = coinsReward * order.cartData.reduce((total, item) => total + (item.Quantity || 0), 0);

//             // Check if the user already has a coins record for the same coupon and order
//             const existingCoinsRecord = await Coins.findOne({
//                 userId: userId,
//                 Coupon: couponCode,
//                 orderId: orderId,
//             });

//             if (!existingCoinsRecord) {
//                 // Create a new Coins record
//                 const newCoinsRecord = new Coins({
//                     userId: userId,
//                     Amount: amount,
//                     Description: `Greetings! You earned ${amount} coins on order placed by ${userName} with Order ID ${showOrderId}.`,
//                     orderId: orderId,
//                     Coupon: couponCode,
//                     Type: '0',
//                     Trans_Type: 'Credit',
//                 });
//                 await newCoinsRecord.save();
//                 user.Coins += amount;
//                 await user.save();
//             } else {
//                 console.log(`Coins reward already added for user ${userId} and coupon ${couponCode}`);
//             }
//         } else {
//             console.log('Conditions not met for adding coins reward.');
//         }
//     } catch (error) {
//         console.error('Error processing order response:', error);
//     }
// };

module.exports = route;
