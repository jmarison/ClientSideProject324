document.addEventListener('DOMContentLoaded', function () {
    const weightLossForm = document.getElementById("weightLossForm");
    const addFoodButton = document.getElementById('addFood');
    const foodInput = document.getElementById('foodInput');
    const foodCalories = document.getElementById('foodCalories');
    const foodLog = document.getElementById('foodLog');

    if (weightLossForm) {
        weightLossForm.addEventListener("submit", function (event) {
            event.preventDefault(); // prevent page reload

            // collect user input
            const age = document.getElementById("ageInput").value;
            const sex = document.getElementById("sexInput").value;
            const weight = document.getElementById("weightInput").value;
            const height = document.getElementById("heightInput").value;
            const activity = document.getElementById("activityInput").value;
            const goal = document.getElementById("goalInput").value;

            // Validate inputs
            if (!age || !sex || !weight || !height || !activity || !goal) {
                alert("Please fill out all fields.");
                return;
            }

            // Prepare data for API request
            const userData = { age, sex, weight, height, activity, goal };

            // Send data to backend
            fetch("http://localhost:3000/calculate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById("calorieFinal").innerHTML = `<h3>Daily Caloric Intake: ${data.calories} kcal</h3>`;
            })
            .catch(error => {
                console.error("Error:", error);
            });
        });
    }

    if (addFoodButton && foodInput && foodCalories && foodLog) {
        addFoodButton.addEventListener('click', function() {
            const foodInputValue = foodInput.value;
            const foodCaloriesValue = foodCalories.value;

            if (foodInputValue && foodCaloriesValue) {
                const newFoodItem = document.createElement('div');
                newFoodItem.classList.add('food-item');

                const foodText = document.createElement('span');
                foodText.textContent = `${foodInputValue} - ${foodCaloriesValue} calories`;

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-button');
                deleteButton.addEventListener('click', function() {
                    newFoodItem.remove();
                });

                newFoodItem.appendChild(foodText);
                newFoodItem.appendChild(deleteButton);

                foodLog.appendChild(newFoodItem);

                foodInput.value = '';
                foodCalories.value = '';
            } else {
                alert('Please enter both food item and calories.');
            }
        });
    } else {
        console.error("One or more elements are missing in the DOM.");
    }
});