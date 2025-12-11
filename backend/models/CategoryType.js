const mongoose = require('mongoose');

const categoryTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Lütfen kategori türü adını giriniz']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CategoryType', categoryTypeSchema);
