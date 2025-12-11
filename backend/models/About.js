const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
    aboutText: {
        type: String,
        required: [true, 'Lütfen hakkımızda kısmını giriniz']
    },
    visionText: {
        type: String,
        required: [true, 'Lütfen vizyon kısmını giriniz']
    },
    missionText: {
        type: String,
        required: [true, 'Lütfen misyon kısmını giriniz']
    },
    phoneNumber:{
        type: String,
        required: [true, 'Lütfen telefon numarasını giriniz']
    },
    email:{
        type: String,
        required: [true, 'Lütfen email adresini giriniz']
    },
    address:{
        type: String,
        required: [true, 'Lütfen adresi giriniz']
    },
    fax:{
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('About', aboutSchema);