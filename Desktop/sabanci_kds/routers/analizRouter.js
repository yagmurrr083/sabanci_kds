const express = require('express');
const router = express.Router();
const analizController = require('../controllers/analizController');

router.get('/analiz', analizController.getDashboardData);

module.exports = router;
