const express = require('express')
const route = express.Router()
const User = require('../../../Models/FrontendSide/user_model')
const authMiddleWare = require('../../../Middleware/authMiddleWares')

// update reseller memeber ship status 
route.post("/update/usertype", authMiddleWare, async (req, res) => {
    const userId = req.user.userId;
    const updateStatus = req.body?.updateStatus;
    let amount = req.body?.amount;

    if (amount) {
        amount = Number(amount);
    }

    if (!amount) {
        return res.send({ type: "error", message: "Amount cannot be null" });
    }

    try {
        // Fetch the user
        const newUser = await User.findById(userId);
        
        // Check if user exists
        if (!newUser) {
            return res.status(404).json({ type: "error", message: "User not found!" });
        }

        // Update user type
        newUser.User_Type = updateStatus;

        // Update wallet if amount is provided
        if (amount) {
            newUser.Wallet = (newUser?.Wallet || 0) + amount; // Fallback to 0 if wallet is null or undefined
        }

        // Save the updated user
        await newUser.save();


        // Return success response
        return res.status(200).json({ type: "success", message: "User status updated successfully!" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ type: "error", message: "Server error!", errorMessage: error });
    }
});



module.exports = route

