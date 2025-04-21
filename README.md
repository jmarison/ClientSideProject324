# Fitcal

Fitcal is a web application designed to help users track their daily caloric intake and manage their fitness goals effectively.

## Features

- Calculate daily caloric intake based on user inputs (age, weight, height, activity level, and goal).
- Log food items with calorie values.
- Visualize remaining calories using a progress meter.
- Delete food items from the log to update calorie tracking.

## Installation

1. Clone the repository:
   git clone https://github.com/your-username/fitcal.git

2. Navigate to the project directory:
    cd fitcal

3. Install dependencies (if applicable):
    npm install

## Usage
1. Start the backend server:
    node server.js

## API Endpoints
    POST /calculate
    Description: Calculates daily caloric intake based on user data.
    Request Body:
        {
            "age": 25,
            "sex": "male",
            "weight": 70,
            "height": 175,
            "activity": "moderate",
            "goal": "maintain"
        }
    Response:
        {
            "calories": 2500
        }

## Technologies Used
    HTML, CSS, JavaScript
    Node.js (for backend API)
    sFetch API for client-server communication
