
const app = require('./app');
const PORT = process.env.PORT || 5000;

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