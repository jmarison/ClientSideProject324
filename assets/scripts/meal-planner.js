document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const dailyCaloriesInput = document.getElementById('daily-calories');
    const proteinInput = document.getElementById('protein-percentage');
    const carbsInput = document.getElementById('carbs-percentage');
    const fatsInput = document.getElementById('fats-percentage');
    const dietaryPreferencesSelect = document.getElementById('dietary-preferences');
    const generatePlanBtn = document.getElementById('generate-plan-btn');
    const mealPlanContainer = document.getElementById('meal-plan-container');
    
    // Function to populate form fields from localStorage
    function populateFormFields() {
        // Try to get the nutrition data from localStorage
        const storedData = localStorage.getItem('userGoals');
        
        // If data exists in localStorage
        if (storedData) {
            try {
                // Parse the JSON data
                const nutritionData = JSON.parse(storedData);
                
                // Update form fields with stored values
                if (nutritionData.calories) {
                    dailyCaloriesInput.value = nutritionData.calories;
                }
                
                if (nutritionData.protein) {
                    proteinInput.value = nutritionData.protein;
                }
                
                if (nutritionData.carbs) {
                    carbsInput.value = nutritionData.carbs;
                }
                
                if (nutritionData.fats) {
                    fatsInput.value = nutritionData.fats;
                }
                
                console.log('Form populated from localStorage:', nutritionData);
            } catch (error) {
                console.error('Error parsing nutrition data from localStorage:', error);
            }
        } else {
            console.log('No nutrition data found in localStorage');
        }
    }
    
    // Function to send data to backend
    async function sendToBackend() {
        // Show loading state
        generatePlanBtn.disabled = true;
        generatePlanBtn.textContent = 'Generating...';
        
        // Get form values
        const formData = {
            calories: parseInt(dailyCaloriesInput.value) || 0,
            protein: parseInt(proteinInput.value) || 0,
            carbs: parseInt(carbsInput.value) || 0,
            fats: parseInt(fatsInput.value) || 0,
            dietaryPreference: dietaryPreferencesSelect.value
        };
        
        try {
            // Send data to backend API

            const token = localStorage.getItem('userToken'); // Get token from localStorage

            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Only add Authorization header if token exists
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('http://localhost:3000/api/meal-plan/generate', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            
            // Parse response data
            const responseData = await response.json();
            
            if (responseData.success && responseData.data) {
                // Display the meal plan
                displayMealPlan(responseData.data);
            } else {
                throw new Error('Invalid response from server');
            }
            
        } catch (error) {
            console.error('Error fetching meal plan from backend:', error);
            
            // Display error message to user
            mealPlanContainer.innerHTML = `
                <div class="error-message">
                    <h3>Oops! Something went wrong</h3>
                    <p>We couldn't generate your meal plan at this time. Please try again later.</p>
                    <p>Error details: ${error.message}</p>
                </div>
            `;
            mealPlanContainer.style.display = 'block';
            
        } finally {
            // Reset button state
            generatePlanBtn.disabled = false;
            generatePlanBtn.textContent = 'Generate Meal Plan';
        }
    }
    
    // Function to display the meal plan
    function displayMealPlan(mealPlanData) {
        // Clear previous meal plan
        mealPlanContainer.innerHTML = '';
        
        // Create meal plan header
        const headerElement = document.createElement('div');
        headerElement.className = 'meal-plan-header';
        headerElement.innerHTML = `
            <h2>Your Personalized Meal Plan</h2>
            <div class="meal-plan-summary">
                <div class="summary-item">
                    <span class="summary-label">Calories:</span>
                    <span class="summary-value">${mealPlanData.totalCalories || '-'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Protein:</span>
                    <span class="summary-value">${mealPlanData.totalProtein || '-'}g</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Carbs:</span>
                    <span class="summary-value">${mealPlanData.totalCarbs || '-'}g</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Fats:</span>
                    <span class="summary-value">${mealPlanData.totalFats || '-'}g</span>
                </div>
            </div>
        `;
        mealPlanContainer.appendChild(headerElement);
        
        // Create container for meals
        const mealsContainer = document.createElement('div');
        mealsContainer.className = 'meals-container';
        
        // Check if we have meals data
        if (mealPlanData.meals && Array.isArray(mealPlanData.meals)) {
            // Create each meal section
            mealPlanData.meals.forEach(meal => {
                const mealElement = document.createElement('div');
                mealElement.className = 'meal';
                mealElement.innerHTML = `
                    <h3>${meal.name || 'Meal'}</h3>
                    <div class="meal-details">
                        <div class="meal-image">
                            <img src="${meal.image_url || 'https://source.unsplash.com/featured/?food'}" alt="${meal.food_name}" class="meal-thumbnail">
                        </div>
                        <div class="meal-info">
                            <p class="meal-name">${meal.food_name || '-'}</p>
                            <p class="meal-description">${meal.description || ''}</p>
                        </div>
                        <div class="meal-macros">
                            <span>${meal.calories || 0} cal</span>
                            <span>${meal.protein || 0}g protein</span>
                            <span>${meal.carbs || 0}g carbs</span>
                            <span>${meal.fats || 0}g fats</span>
                        </div>
                    </div>
                `;
                
                // If meal has food items, display them
                if (meal.foods && Array.isArray(meal.foods) && meal.foods.length > 0) {
                    const foodsList = document.createElement('ul');
                    foodsList.className = 'foods-list';
                    
                    meal.foods.forEach(food => {
                        const foodItem = document.createElement('li');
                        foodItem.className = 'food-item';
                        foodItem.innerHTML = `
                            <div class="food-image">
                                <img src="${food.image_url || 'https://source.unsplash.com/featured/?food'}" alt="${food.food_name}" class="food-thumbnail">
                            </div>
                            <div class="food-info">
                                <span class="food-name">${food.food_name}</span>
                                <span class="food-serving">${food.serving_size} ${food.serving_unit}</span>
                                <span class="food-calories">${food.calories} cal</span>
                            </div>
                        `;
                        foodsList.appendChild(foodItem);
                    });
                    
                    mealElement.appendChild(foodsList);
                }
                
                mealsContainer.appendChild(mealElement);
            });
        } else {
            // No meals data
            mealsContainer.innerHTML = '<p>No meal information available.</p>';
        }
        
        mealPlanContainer.appendChild(mealsContainer);
        
        // Add action buttons
        const actionsElement = document.createElement('div');
        actionsElement.className = 'meal-plan-actions';
        actionsElement.innerHTML = `
            <button id="print-plan-btn" class="btn btn-outline">Print Plan</button>
        `;
        mealPlanContainer.appendChild(actionsElement);
        
        // Make meal plan visible
        mealPlanContainer.style.display = 'block';
        
        // Add event listener for print button
        document.getElementById('print-plan-btn').addEventListener('click', function() {
            window.print();
        });
    }
    
    // Event listener for generate button
    generatePlanBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!dailyCaloriesInput.value) {
            alert('Please enter your daily calorie target');
            dailyCaloriesInput.focus();
            return;
        }
        
        // Send data to backend
        sendToBackend();
    });
    
    // Initialize the form
    populateFormFields();
});