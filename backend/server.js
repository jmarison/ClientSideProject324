const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors()); // cors to allow frontend to make requests
app.use(bodyParser.json()); // Parse JSON body

// function to calculate daily caloric intake
function calculateCalories(age, sex, weight, height, activity, goal) {
    let bmr;

    // convert sex input to string values for logic
    if (sex == "2") {
        // male BMR Calculation
        bmr = 66 + (6.23 * weight) + (12.7 * height) - (6.8 * age);
    } else if (sex == "1") {
        // female BMR Calculation
        bmr = 655 + (4.35 * weight) + (4.7 * height) - (4.7 * age);
    } else {
        // approximate for "Other" (Average of Male & Female formulas)
        bmr = (66 + 655) / 2 + ((6.23 + 4.35) / 2 * weight) + ((12.7 + 4.7) / 2 * height) - ((6.8 + 4.7) / 2 * age);
    }

    // activity multipliers
    const activityMultipliers = {
        "1": 1.2,  // Little to no exercise
        "2": 1.375, // Light exercise (1-3 days per week)
        "3": 1.55,  // Moderate exercise (4-5 days per week)
        "4": 1.725, // Hard exercise (6-7 days per week)
        "5": 1.9    // Intense exercise (twice per day)
    };

    // adjust BMR based on activity level
    let dailyCalories = bmr * activityMultipliers[activity];

    // adjust based on goal
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

// API Endpoint to calculate calories
app.post("/calculate", (req, res) => {
    const { age, sex, weight, height, activity, goal } = req.body;

    if (!age || !sex || !weight || !height || !activity || !goal) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    const calories = calculateCalories(age, sex, weight, height, activity, goal);
    res.json({ calories });
    // console.log({ calories });
});

// start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
