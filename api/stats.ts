// Middleware to set Content-Type header for JSON responses
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// Example endpoint returning JSON
app.get('/stats', (req, res) => {
    const stats = {
        message: 'Statistics data',
        timestamp: new Date().toISOString()
    };
    res.json(stats);
});
