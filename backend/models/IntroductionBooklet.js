const mongoose = require('mongoose');

const IntroductionBookletSchema = new mongoose.Schema({ 
    description: {
        type: String,
    },
    coverImageUrl: {
        type: String,
        default: null
    },
    fileUrl: {
        type: String,
        default: null
    }, 
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('IntroductionBooklet', IntroductionBookletSchema);
