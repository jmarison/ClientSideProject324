const express = require('express');
const router = express.Router();
const {generateMealPlan} = require('../controllers/meal-plannerController');
const { optionalAuth } = require('../middlewares/optionalauthMiddleware');


/**
 POST /api/meal-plan/generate
 Generate a personalized meal plan based on user preferences
 Access Public as well as Private (optional authentication)
 */
router.post('/meal-plan/generate', optionalAuth , generateMealPlan);

module.exports = router;