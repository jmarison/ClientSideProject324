const express = require('express');
const router = express.Router();
const { calculateNutrition } = require('../controllers/nutritionController');

// can be accessed by any users without login
router.post('/calculate', calculateNutrition);

module.exports = router;