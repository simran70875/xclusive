const jwt = require('jsonwebtoken');
const express = require('express')
const bcrypt = require('bcrypt');
const Admin = require('../../Models/Admin/admin_model');
const route = express.Router();
const checkAdminRole = require('../../Middleware/adminMiddleWares')

const secretKey = process.env.JWT_TOKEN;

// Admin register route
route.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        const admin = await Admin.findOne({ username });

        if (admin) {
            return res.status(401).json({ type: 'error', message: 'Username already used!' });
        }


        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            username,
            password: hashedPassword
        });

        await newAdmin.save();

        res.status(200).json({ type: 'success', message: 'Admin registered successfully', newAdmin });
    } catch (error) {
        res.status(500).json({ type: 'error', message: 'Error authenticating admin', error });
    }
});


// Admin login route
route.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(200).json({ type: 'error', message: '*Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);

        if (!passwordMatch) {
            return res.status(200).json({ type: 'error', message: '*Invalid credentials' });
        }

        // Generate a JWT token 
        const token = jwt.sign({ id: admin._id, role: 'admin' }, secretKey);

        res.status(200).json({ type: 'success', message: 'Admin logged in successfully', token });
    } catch (error) {
        res.status(500).json({ type: 'error', message: 'Error authenticating admin', error });
        console.log(error)
    }
});

// Change password route
route.post('/changePassword', async (req, res) => {
    try {
        const { username, oldPassword, newPassword } = req.body;

        // Find the admin by username
        const admin = await Admin.findOne();

        if (!admin) {
            return res.status(200).json({ type: 'error', message: '*Admin not found' });
        }

        // Check if the old password matches
        const passwordMatch = await bcrypt.compare(oldPassword, admin.password);

        if (!passwordMatch) {
            return res.status(200).json({ type: 'error', message: '*Invalid old password' });
        }

        // Update the password with the new one
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        admin.password = hashedNewPassword;
        await admin.save();

        res.status(200).json({ type: 'success', message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ type: 'error', message: 'Error changing password', error });
        console.log(error);
    }
});


// get all admin
route.get('/get', async (req, res) => {
    try {
        const Admins = await Admin.find()
        res.status(200).json({ type: 'success', message: 'Admin find successfully', Admins });
    } catch (error) {
        res.send(error)
        console.log(error)
    }
})

module.exports = route
