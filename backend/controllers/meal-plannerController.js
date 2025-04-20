const axios = require('axios');

/**
 * Generate a meal plan based on user preferences
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateMealPlan = async (req, res) => {
  try {
    // Get parameters from request body
    const { calories, protein, carbs, fats, dietaryPreference } = req.body;
    
    // console.log('Received meal plan request:', req.body);
    // Basic validation
    if (!calories) {
      return res.status(400).json({
        error: true,
        message: 'Daily calorie target is required'
      });
    }
    
    // Call Nutritionix API to get meal suggestions
    // This is a simplified example - in a real app, you would use your Nutritionix API credentials
    const headers = {
      'x-app-id': process.env.NUTRITIONIX_APP_ID,
      'x-app-key': process.env.NUTRITIONIX_API_KEY,
      'x-remote-user-id': '0',
      'Content-Type': 'application/json'
    };
    
    // Generate meal plan structure
    const mealPlan = {
      meals: await _generateSampleMeals(calories, protein, carbs, fats, dietaryPreference, headers),
      totalCalories: calories,
      totalProtein: protein,
      totalCarbs: carbs,
      totalFats: fats,
      dietaryPreference
    };

    // If user is authenticated, you can save this meal plan to their history
    if (req.user) {
      // Here you could save the meal plan to the user's history
      console.log(`Meal plan generated for authenticated user: ${req.user._id}`);
      
      // Add user ID to the response
      mealPlan.userId = req.user._id;
      
      // Optional: Save meal plan to user history
      await saveMealPlanToUserHistory(req.user._id, mealPlan);
      
    } else {
      console.log('Meal plan generated for unauthenticated user');
    }
    
    // Return the meal plan
    res.json({
      success: true,
      data: mealPlan
    });
    
  } catch (error) {
    console.error('Error generating meal plan:', error);
    res.status(500).json({
      error: true,
      message: 'Error generating meal plan',
      details: error.message
    });
  }
};

/**
 * Generate sample meals based on user preferences
 * This is a simplified implementation
 */
const _generateSampleMeals = async (calories, protein, carbs, fats, dietaryPreference, headers) => {
  try {
    // Define meal distribution
    const mealDistribution = {
      breakfast: 0.3,
      lunch: 0.35,
      dinner: 0.25,
      snacks: 0.1
    };
    
    // Get food queries based on dietary preference
    const foodQueries = _getFoodQueriesByDiet(dietaryPreference);
    const meals = [];
    
    // Generate each meal
    for (const [mealType, percentage] of Object.entries(mealDistribution)) {
      const mealCalories = Math.round(calories * percentage);
      const mealProtein = protein ? Math.round(protein * percentage) : 0;
      const mealCarbs = carbs ? Math.round(carbs * percentage) : 0;
      const mealFats = fats ? Math.round(fats * percentage) : 0;
      
      // Select a random food query for this meal type
      const foodOptionsForMeal = foodQueries[mealType];
      const randomIndex = Math.floor(Math.random() * foodOptionsForMeal.length);
      const selectedFoodQuery = foodOptionsForMeal[randomIndex];
      
      try {
        // Try to get nutritional data from Nutritionix API
        // https://trackapi.nutritionix.com/v2/natural/nutrients/
        const response = await axios({
          method: 'post',
          url: 'https://trackapi.nutritionix.com/v2/natural/nutrients/',
          headers: headers,
          data: {
            query: selectedFoodQuery
          }
        });
        
        const foods = response.data.foods || [];
        
        // Create meal object with nutritional data
        const meal = {
          name: _capitalizeMealType(mealType),
          food_name: selectedFoodQuery,
          description: `${selectedFoodQuery} (${dietaryPreference || 'balanced'})`,
          calories: mealCalories,
          protein: mealProtein,
          carbs: mealCarbs,
          fats: mealFats,
          // Get image URL from first food item or use a food-type placeholder
          image_url: foods[0]?.photo?.highres || foods[0]?.photo?.thumb || _getPlaceholderImage(mealType),
          foods: foods.map(food => ({
            food_name: food.food_name,
            serving_size: food.serving_qty,
            serving_unit: food.serving_unit,
            calories: Math.round(food.nf_calories || 0),
            protein: Math.round(food.nf_protein || 0),
            carbs: Math.round(food.nf_total_carbohydrate || 0),
            fats: Math.round(food.nf_total_fat || 0),
            image_url: food.photo?.thumb || _getPlaceholderImage(mealType)
          }))
        };
        
        meals.push(meal);
        
      } catch (error) {
        // If API call fails, use placeholder meal
        console.error(`Error getting nutrition for ${mealType}:`, error.message);
        
        // Add placeholder meal
        meals.push({
          name: _capitalizeMealType(mealType),
          food_name: `${dietaryPreference || 'balanced'} ${mealType}`,
          description: `A nutritious ${mealType} option`,
          calories: mealCalories,
          protein: mealProtein,
          carbs: mealCarbs,
          fats: mealFats,
          image_url: _getPlaceholderImage(mealType),
          foods: [{
            food_name: selectedFoodQuery,
            serving_size: 1,
            serving_unit: 'serving',
            calories: mealCalories,
            protein: mealProtein,
            carbs: mealCarbs,
            fats: mealFats,
            image_url: _getPlaceholderImage(mealType)
          }]
        });
      }
    }
    
    return meals;
  } catch (error) {
    console.error('Error generating sample meals:', error);
    // Return basic placeholder meals if everything fails
    return _getPlaceholderMeals(calories, protein, carbs, fats, dietaryPreference);
  }
};

/**
 * Get food queries based on dietary preference
 */
const _getFoodQueriesByDiet = (dietaryPreference) => {
  // Define default meal suggestions
  const foodQueries = {
    breakfast: [
      'oatmeal with banana and honey',
      '2 eggs with toast',
      'greek yogurt with granola and berries'
    ],
    lunch: [
      'turkey sandwich with vegetables',
      'chicken salad',
      'quinoa bowl with vegetables'
    ],
    dinner: [
      'grilled salmon with rice and vegetables',
      'pasta with chicken and vegetables',
      'beef stir-fry with rice'
    ],
    snacks: [
      'apple with peanut butter',
      'greek yogurt with honey',
      'protein bar'
    ]
  };
  
  // Adjust based on dietary preference
  if (dietaryPreference === 'vegetarian') {
    foodQueries.lunch = [
      'vegetable wrap with hummus',
      'quinoa salad with feta and vegetables',
      'lentil soup with bread'
    ];
    foodQueries.dinner = [
      'vegetable stir-fry with tofu',
      'eggplant parmesan',
      'pasta primavera'
    ];
  } else if (dietaryPreference === 'vegan') {
    foodQueries.breakfast = [
      'oatmeal with almond milk and banana',
      'tofu scramble with vegetables',
      'fruit smoothie with plant protein'
    ];
    foodQueries.lunch = [
      'hummus wrap with vegetables',
      'quinoa salad with chickpeas',
      'lentil soup'
    ];
    foodQueries.dinner = [
      'vegetable stir-fry with tofu',
      'chickpea curry with rice',
      'pasta with tomato sauce and vegetables'
    ];
    foodQueries.snacks = [
      'apple with almond butter',
      'trail mix',
      'hummus with carrots'
    ];
  }
  
  return foodQueries;
};

/**
 * Get placeholder meals if API calls fail
 */
const _getPlaceholderMeals = (calories, protein, carbs, fats, dietaryPreference) => {
  return [
    {
      name: 'Breakfast',
      food_name: 'Breakfast meal',
      description: 'A nutritious breakfast option',
      calories: Math.round(calories * 0.3),
      protein: protein ? Math.round(protein * 0.3) : 0,
      carbs: carbs ? Math.round(carbs * 0.3) : 0,
      fats: fats ? Math.round(fats * 0.3) : 0,
      image_url: _getPlaceholderImage('breakfast'),
      foods: []
    },
    {
      name: 'Lunch',
      food_name: 'Lunch meal',
      description: 'A nutritious lunch option',
      calories: Math.round(calories * 0.35),
      protein: protein ? Math.round(protein * 0.35) : 0,
      carbs: carbs ? Math.round(carbs * 0.35) : 0,
      fats: fats ? Math.round(fats * 0.35) : 0,
      image_url: _getPlaceholderImage('lunch'),
      foods: []
    },
    {
      name: 'Dinner',
      food_name: 'Dinner meal',
      description: 'A nutritious dinner option',
      calories: Math.round(calories * 0.25),
      protein: protein ? Math.round(protein * 0.25) : 0,
      carbs: carbs ? Math.round(carbs * 0.25) : 0,
      fats: fats ? Math.round(fats * 0.25) : 0,
      image_url: _getPlaceholderImage('dinner'),
      foods: []
    },
    {
      name: 'Snacks',
      food_name: 'Snack options',
      description: 'Nutritious snack options',
      calories: Math.round(calories * 0.1),
      protein: protein ? Math.round(protein * 0.1) : 0,
      carbs: carbs ? Math.round(carbs * 0.1) : 0,
      fats: fats ? Math.round(fats * 0.1) : 0,
      image_url: _getPlaceholderImage('snacks'),
      foods: []
    }
  ];
};

/**
 * Capitalize meal type for display
 */
const _capitalizeMealType = (mealType) => {
  return mealType.charAt(0).toUpperCase() + mealType.slice(1);
};

/**
 * Get placeholder image URL based on meal type
 */
const _getPlaceholderImage = (mealType) => {
  const placeholders = {
    breakfast: 'https://source.unsplash.com/featured/?breakfast',
    lunch: 'https://source.unsplash.com/featured/?lunch',
    dinner: 'https://source.unsplash.com/featured/?dinner',
    snacks: 'https://source.unsplash.com/featured/?snacks'
  };
  
  return placeholders[mealType] || 'https://source.unsplash.com/featured/?food';
};

module.exports = {
  generateMealPlan
};