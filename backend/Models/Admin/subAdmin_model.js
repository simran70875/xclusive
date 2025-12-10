const mongoose = require('mongoose');

const subAdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['role_1', 'role_2', 'role_3', 'role_4', 'role_5'],
    },
});

module.exports = mongoose.model('SubAdmin', subAdminSchema);
