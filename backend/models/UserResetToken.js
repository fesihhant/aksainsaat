const mongoose = require('mongoose');

const userResetTokenSchema = new mongoose.Schema({
    
    userId: {
        type: mongoose.Schema.Types.ObjectId, // User _id'si ile aynı tip
        ref: 'User',                      // Referans verilen model adı
        default: null
    },
    resetToken: {
        type: String,
        default:null
    },
    expireDate: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('UserResetToken', userResetTokenSchema);
