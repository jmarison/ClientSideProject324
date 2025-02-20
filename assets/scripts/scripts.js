document.addEventListener('DOMContentLoaded', function () {
    // Function to handle form submission and calculate daily calorie intake
    function registerValues() {
        'use strict';
        const ageValue = document.getElementById('ageInput');
        const sexValue = document.getElementById('sexInput');
        const currWeightValue = document.getElementById('currWeightInput');
        const heightValue = document.getElementById('heightInput');
        const goalWeightValue = document.getElementById('goalWeightInput');
        const endDateValue = document.getElementById('endDateInput');
        const calorieTextDiv = document.getElementById('calorieFinal');

        const age = ageValue.value;
        const sex = sexValue.value;
        const currWeight = currWeightValue.value;
        const height = heightValue.value;
        const goalWeight = goalWeightValue.value;
        const endDate = endDateValue.value;
        let caloriesPerDay = 0;

        console.log(age);
        console.log(sex);
        console.log(currWeight);
        console.log(height);
        console.log(goalWeight);
        console.log(endDate);

        console.log("submission of values");

        caloriesPerDay = calculateWeightLoss(age, sex, currWeight, height, goalWeight, endDate);
        console.log(caloriesPerDay);

        calorieTextDiv.innerHTML = "Daily Caloric Intake: " + caloriesPerDay + " per day.";
    }

    function calculateWeightLoss(age, sex, currWeight, height, goalWeight, endDate) {
        // TODO: Replace with actual algorithm to calculate daily calories for weight loss
        return currWeight - goalWeight;
    }

    document.getElementById("weightLossForm").addEventListener("submit", function (event) {
        // Prevent the form from submitting and reloading the page
        event.preventDefault(); 
        registerValues();
    });
});
