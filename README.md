![Logo](https://github.com/joshwant/COMP3000-JOSHWANT/blob/main/meal-planner-app/frontend/app/assets/mainlogo.png?raw=true)
# PrepIt - Meal Planning and AI-Powered Price Comparison Mobile App
## Allocated Supervisor
Bogdan Ghita

## Project Summary
For busy individuals and families. <br>
Whose problem is their lack of time to meal plan and are stressed, unorganised, and/or want to cut down on meal costs. <br>
The AI-Powered Meal Planning and Smart Shopping App <br>
Is a mobile application <br>
That simplifies meal planning, generates AI-powered price comparisons based on shopping list, and plan cost-effective shopping across different supermarkets. <br>

## Features
-	Recipe Finder: Integrated with TheMealDB's API to allow users to discover new meals based on their preferences.
-	Weekly Meal Planning Calendar: A user-friendly interface to schedule meals throughout the week.
-	Shopping List: Create a personalised shopping list.
-	AI-Matching Price Comparison: Web-scrapes top UK supermarkets to gather price data, using Mistral AI to match products to determine which has the best overall price for the users shop.
-	User Authentication: Users will need to log in to save weekly meals, and shopping list data.
-	Streamlined UI/UX: Focus on the user interface to provide a smooth experience for the user.


## Technology Stack:
- Mobile App: React Native with Expo Go
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: Firebase Authentication
- AI features: Mistral AI API (https://mistral.ai/)
- Recipes API: TheMealDB API (Free for educational use - https://www.themealdb.com/)

## How to Run the Project
- Install Expo Go on your mobile device
- Clone the repository
- Get and add your API and database keys to the .env files
- Change your IP address in the backend server.js file to your local IP address
- Open the terminal and navigate to the project directory
### Start the backend server:
- Navigate to the backend directory
- Run `npm install` to install dependencies
- Run `node server.js` to start the server
### Start the frontend app:
- Navigate to the frontend directory
- Run `npm install` to install dependencies
- Run `npx expo start` to start the app
- Scan the QR code with Expo Go on your mobile device to view the app