const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Call connectDB function
connectDB();

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // User profile data
  profile: {
    age: Number,
    sex: String,
    weight: Number,
    height: Number,
    activity: String,
    goal: String
  }
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Auth Middleware
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// User Routes

// Register user
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with that email or username already exists' 
      });
    }
    
    // Create new user
    const user = new User({ username, email, password });
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login user
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
app.get('/api/users/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
app.put('/api/users/profile', auth, async (req, res) => {
  try {
    const { age, sex, weight, height, activity, goal } = req.body;
    
    // Find user and update profile
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.profile = {
      age, 
      sex, 
      weight, 
      height, 
      activity, 
      goal
    };
    
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// function to calculate daily caloric intake
function calculateCalories(age, sex, weight, height, activity, goal) {
    let bmr;

    // convert sex input to string values for logic
    if (sex === "Male") {
        // male BMR Calculation
        bmr = 66 + (6.23 * weight) + (12.7 * height) - (6.8 * age);
    } else if (sex === "Female") {
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

// Original API Endpoint to calculate calories and macros (kept for backward compatibility)
app.post("/calculate", (req, res) => {
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
});

// New API Endpoint for public calculations
app.post("/api/fitness/calculate", (req, res) => {
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
});

// New API Endpoint for authenticated calculations
app.post("/api/fitness/calculate/user", auth, async (req, res) => {
    try {
        // If no request body is provided, try to use user's profile data
        if (Object.keys(req.body).length === 0) {
            const user = await User.findById(req.user.id);
            if (!user || !user.profile) {
                return res.status(400).json({ error: "No profile data found. Please update your profile." });
            }
            
            const { age, sex, weight, height, activity, goal } = user.profile;
            
            const calories = calculateCalories(age, sex, weight, height, activity, goal);
            const macros = calculateMacros(calories, goal, weight);
            
            res.json({ 
                calories,
                macros
            });
        } else {
            // Use provided data for calculation
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
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});