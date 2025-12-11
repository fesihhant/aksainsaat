const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Lütfen adınızı ve soyadınızı giriniz']
    },
    email: {
        type: String,
        required: [true, 'Lütfen e-posta adresinizi giriniz'],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Lütfen geçerli bir e-posta adresi giriniz']
    },
    phone: { type: String, required: true, unique: true },
    password: {
        type: String,
        required: [true, 'Lütfen şifrenizi giriniz'],
        minlength: [6, 'Şifre en az 6 karakter olmalıdır']
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    avatar: {
        type: String,
        default: '/uploads/avatars/default.jpg'
    },
    avatarType: {
        type: String,
        enum: ['upload', 'preset'],
        default: 'preset'
    },
    isActivated: { 
        type: Boolean, 
        default: false 
    },
    activationToken: { 
        type: String 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
