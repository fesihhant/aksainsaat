const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Lütfen kategori adını giriniz']
    },
    categoryTypeId: {
        type: mongoose.Schema.Types.ObjectId, // CategoryType _id'si ile aynı tip
        ref: 'CategoryType',                      // Referans verilen model adı
        required: [true, 'Lütfen kategori türünü seçiniz'],
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Category', categorySchema);
