const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const url = process.env.IS_LOCAL_DB === 'true' ? process.env.MONGODB_URI_LOCAL : process.env.MONGODB_URI_PROD;
        console.log('Connecting to MongoDB at:', url);
        const conn = await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    } catch (error) {
        process.exit(1);
    }
};

module.exports = connectDB;
