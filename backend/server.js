const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB database
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests from frontend
app.use(bodyParser.json()); // Parse JSON request bodies

// Import routes
const authRoutes = require('./routes/authRoutes');
const nutritionRoutes = require('./routes/nutritionRoutes');
const mealPlannerRoutes = require('./routes/meal-plannerRoutes');

// Mount routes
app.use('/api/users', authRoutes); // Authentication endpoints 
app.use('/api/nutrition', nutritionRoutes); // Nutrition calculation endpoints
app.use('/api', mealPlannerRoutes); // Meal planner end point for generating meal plans

// Route to check for authentication status
// Frontend can use this to determine whether to redirect to login
app.get('/api/auth/status', (req, res) => {
  // This route is just for the frontend to ping,
  // actual authorization is handled by the protect middleware
  // on protected routes
  res.status(200).json({ message: 'Authentication endpoint is working' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});