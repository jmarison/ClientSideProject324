document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("weightLossForm").addEventListener("submit", function (event) {
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
});
