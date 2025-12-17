const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5001;

async function start() {
    try {
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        server.on('error', (err) => {
            console.error('Server error:', err);
            if (err && err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use.`);
            }
            process.exit(1);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

start();