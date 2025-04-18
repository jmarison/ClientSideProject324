document.addEventListener('DOMContentLoaded', function () {
    // Store the original HTML content of the results container
    const originalResultsHTML = document.getElementById("calorieFinal").innerHTML;
    
    const form = document.getElementById('weightLossForm');
    const calorieFinal = document.getElementById('calorieFinal');
    const emptyState = document.getElementById('empty-state');
    
    form.addEventListener("submit", function (event) {
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

        // Show loading indicator and hide empty state
        document.getElementById("calorieFinal").innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Calculating your personalized plan...</p>
            </div>
        `;
        calorieFinal.style.display = 'block';
        emptyState.style.display = 'none';

        // Send data to backend
        fetch("http://localhost:3000/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Restore the original HTML first
            document.getElementById("calorieFinal").innerHTML = originalResultsHTML;
            
            // Now update the values in our restored results container
            document.getElementById("totalCalories").textContent = `${data.calories} calories`;
            
            // Update protein values
            document.getElementById("proteinGrams").textContent = `${data.macros.protein}g`;
            document.getElementById("proteinCalories").textContent = `${data.macros.protein * 4} kcal`;
            const proteinPercent = Math.round(data.macros.protein * 4 / data.calories * 100);
            document.getElementById("proteinPercent").textContent = `${proteinPercent}%`;
            document.getElementById("proteinBar").style.width = `${proteinPercent}%`;
            
            // Update carbs values
            document.getElementById("carbsGrams").textContent = `${data.macros.carbs}g`;
            document.getElementById("carbsCalories").textContent = `${data.macros.carbs * 4} kcal`;
            const carbsPercent = Math.round(data.macros.carbs * 4 / data.calories * 100);
            document.getElementById("carbsPercent").textContent = `${carbsPercent}%`;
            document.getElementById("carbsBar").style.width = `${carbsPercent}%`;
            
            // Update fats values
            document.getElementById("fatsGrams").textContent = `${data.macros.fats}g`;
            document.getElementById("fatsCalories").textContent = `${data.macros.fats * 9} kcal`;
            const fatsPercent = Math.round(data.macros.fats * 9 / data.calories * 100);
            document.getElementById("fatsPercent").textContent = `${fatsPercent}%`;
            document.getElementById("fatsBar").style.width = `${fatsPercent}%`;
            
            // Keep results showing and empty state hidden
            calorieFinal.style.display = 'block';
            emptyState.classList.add('hide');
        })
        .catch(error => {
            console.error("Error:", error);
            document.getElementById("calorieFinal").innerHTML = `
                <div class="error-container">
                    <div class="error-icon">❌</div>
                    <h3>Error Calculating Results</h3>
                    <p>There was a problem connecting to the server. Please try again later.</p>
                    <button class="retry-button" onclick="location.reload()">Try Again</button>
                </div>
            `;
            calorieFinal.style.display = 'block';
        });
    });
});