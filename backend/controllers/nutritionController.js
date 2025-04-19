// Function to calculate daily caloric intake
function calculateCalories(age, sex, weight, height, activity, goal) {
    let bmr;

    // Convert sex input to string values for logic
    if (sex === "Male") {
        // Male BMR Calculation
        bmr = 66 + (6.23 * weight) + (12.7 * height) - (6.8 * age);
    } else if (sex === "Female") {
        // Female BMR Calculation
        bmr = 655 + (4.35 * weight) + (4.7 * height) - (4.7 * age);
    } else {
        // Approximate for "Other" (Average of Male & Female formulas)
        bmr = (66 + 655) / 2 + ((6.23 + 4.35) / 2 * weight) + ((12.7 + 4.7) / 2 * height) - ((6.8 + 4.7) / 2 * age);
    }

    // Activity multipliers
    const activityMultipliers = {
        "1": 1.2,  // Little to no exercise
        "2": 1.375, // Light exercise (1-3 days per week)
        "3": 1.55,  // Moderate exercise (4-5 days per week)
        "4": 1.725, // Hard exercise (6-7 days per week)
        "5": 1.9    // Intense exercise (twice per day)
    };

    // Adjust BMR based on activity level
    let dailyCalories = bmr * activityMultipliers[activity];

    // Adjust based on goal
    const goalAdjustments = {
        "1": -500,  // Weight loss - 10% body mass per week
        "2": -250,  // Mild weight loss - 5% body mass per week
        "3": 0,     // Maintain weight
        "4": 250,   // Mild weight gain - 5% body mass per week
        "5": 500    // Weight gain - 10% body mass per week
    };

    dailyCalories += goalAdjustments[goal];
    
    return Math.round(dailyCalories);
}

// Function to calculate macronutrient breakdown
function calculateMacros(calories, goal, weight) {
    let macros = {
        protein: 0,
        carbs: 0,
        fats: 0
    };
    
    // Different macro ratios based on goals
    if (goal === "1" || goal === "2") {
        // Weight loss goals (high protein)
        macros.protein = Math.round((calories * 0.35) / 4); // 35% of calories from protein (4 calories per gram)
        macros.fats = Math.round((calories * 0.30) / 9);    // 30% of calories from fat (9 calories per gram)
        macros.carbs = Math.round((calories * 0.35) / 4);   // 35% of calories from carbs (4 calories per gram)
    } else if (goal === "3") {
        // Maintenance (balanced)
        macros.protein = Math.round((calories * 0.30) / 4); // 30% of calories from protein
        macros.fats = Math.round((calories * 0.30) / 9);    // 30% of calories from fat
        macros.carbs = Math.round((calories * 0.40) / 4);   // 40% of calories from carbs
    } else {
        // Weight gain goals (higher carbs)
        macros.protein = Math.round((calories * 0.25) / 4); // 25% of calories from protein
        macros.fats = Math.round((calories * 0.25) / 9);    // 25% of calories from fat
        macros.carbs = Math.round((calories * 0.50) / 4);   // 50% of calories from carbs
    }
    
    // Ensure minimum protein based on body weight (0.8g per kg minimum)
    const minProtein = Math.round(weight * 0.8);
    if (macros.protein < minProtein) {
        macros.protein = minProtein;
        // Adjust carbs to maintain calorie total
        const proteinCalories = macros.protein * 4;
        const fatCalories = macros.fats * 9;
        const remainingCalories = calories - (proteinCalories + fatCalories);
        macros.carbs = Math.round(remainingCalories / 4);
    }
    
    return macros;
}

// Controller method to handle calculation endpoint
const calculateNutrition = (req, res) => {
    const { age, sex, weight, height, activity, goal } = req.body;

    if (!age || !sex || !weight || !height || !activity || !goal) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    const calories = calculateCalories(age, sex, weight, height, activity, goal);
    const macros = calculateMacros(calories, goal, weight);
    
    res.json({ 
        calories,
        macros
    });
};

module.exports = { calculateNutrition };