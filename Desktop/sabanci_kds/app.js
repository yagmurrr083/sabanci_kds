require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const analizRouter = require('./routers/analizRouter');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'analiz.html'));
});

app.use('/api', analizRouter);

app.use(errorHandler);

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Sabancı KDS running on http://localhost:${PORT}`);
    });
}

module.exports = app;
