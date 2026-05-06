const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const url =
            process.env.IS_LOCAL_DB === 'true'
                ? process.env.MONGODB_URI_LOCAL
                : process.env.MONGODB_URI_PROD;

        if (!url) {
            throw new Error(
                'Missing MongoDB connection string. Set IS_LOCAL_DB and MONGODB_URI_LOCAL / MONGODB_URI_PROD in your .env.'
            );
        }
        const redactMongoUri = (mongoUri) => mongoUri.replace(/\/\/([^/@]+)@/g, '//***:***@');
        const candidates = [url];
        if (/^mongodb:\/\/localhost(?=[:/])/i.test(url)) {
            candidates.push(url.replace(/^mongodb:\/\/localhost/i, 'mongodb://127.0.0.1'));
        }
        let lastError = null;
        for (const candidate of candidates) {
            const safeUrl = redactMongoUri(candidate);
            console.log('Connecting to MongoDB at:', safeUrl);
            try {
                await mongoose.connect(candidate);
                await mongoose.connection.db.listCollections().toArray();
                return;
            } catch (err) {
                lastError = err;
                const isAuthError =
                    /requires authentication|unauthorized/i.test(err?.message || '') ||
                    err?.codeName === 'Unauthorized' ||
                    err?.code === 13;

                const hasCredentialsInUri = /\/\/[^/]+@/.test(candidate); // mongodb://user:pass@host/...
                const canRetryNext = isAuthError && /^mongodb:\/\/localhost(?=[:/])/i.test(candidate);
                if (!canRetryNext) {
                    const hint = isAuthError && !hasCredentialsInUri
                        ? 'Your MongoDB instance requires authentication for commands, but your URI has no credentials. If you intend to use the local Windows MongoDB service without auth, use mongodb://127.0.0.1:27017/... instead of localhost (Docker/WSL can hijack localhost). Otherwise, create a DB user and update the URI to include USER:PASS (and often authSource=admin).'
                        : 'Verify your MongoDB URI, user permissions, and network access.';
                    throw new Error(`MongoDB command failed. ${hint} Original: ${err.message}`);
                }
                try {
                    await mongoose.disconnect();
                } catch {
                    // ignore
                }
            } finally {
                // no-op: do not disconnect on success (we keep the connection open for the app)
            }
        }
        throw lastError || new Error('MongoDB connection failed.');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
