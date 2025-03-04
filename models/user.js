const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Name is required'],
        unique: true,
        minlength: [3, 'username must be at least 3 characters long'],
        lowercase: true
        
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
   
});

const User = mongoose.model('User', userSchema);
module.exports = User;