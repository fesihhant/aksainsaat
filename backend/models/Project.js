const mongoose = require('mongoose');
const currencyTypes = ['TRY', 'USD', 'EUR', 'GBP', 'JPY']; // İstediğiniz para birimleri
const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Proje adı zorunludur']
    },
    description: {
        type: String,
        required: [true, 'Açıklama zorunludur']
    },
    statusType: {
        type: String,
        required: [true, 'Durum zorunludur'],
        enum: ['true', 'false'],
        default: 'true'
    },
    typeofActivityId: {
        type: mongoose.Schema.Types.ObjectId, // Category'nin _id'si ile aynı tip
        ref: 'Category',                      // Referans verilen model adı
        required: [true, 'Faaliyet türü zorunludur'],
        default: null
    },
    projectCost: {
        type: Number,
        required: [true, 'Maliyet zorunludur'],
        min: [0, 'Fiyat 0\'dan küçük olamaz']
    },
    isVisibleCost: {
        type: Boolean,
        default: false
    },
    currencyType: {
        type: String,
        enum: currencyTypes,
        default: 'TRY',
        required: [true, 'Para birimi zorunludur']
    },
    imageUrls: [{
        type: String,
        default: null
    }],
    videoUrls:[
        {
            type:String,
            default:null
        }
    ],
    youtubeUrl: {
        type: String,
        default: null
    },
    startDate: {
        type: Date,
        required: [true, 'Başlangıç tarihi zorunludur'],
        default: Date.now
    },    
    endDate: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Project', projectSchema);
