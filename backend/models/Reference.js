const mongoose = require('mongoose');

const referenceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Ürün adı zorunludur']
    },
    description: {
        type: String,
        required: [true, 'Açıklama zorunludur']
    },    
    webLink: {
        type: String,
    },
    imageUrl: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('reference', referenceSchema);
