# Fitness RPG Website
---
## Folder Structure
This repository follows a structured folder layout to organize the project efficiently.

```
bed-ca2-Jenjenson-main
├── .gitignore
├── README.md
├── index.js
├── package.json
├── public
│   ├── allianceDetails.html
│   ├── alliances.html
│   ├── challengeDetails.html
│   ├── challenges.html
│   ├── crafting.html
│   ├── index.html
│   ├── items.html
│   ├── login.html
│   ├── monsters.html
│   ├── profile.html
│   ├── quest.html
│   ├── register.html
│   ├── trades.html
│   ├── userDetails.html
│   ├── users.html
│   ├── css
│   │   ├── color.css
│   │   ├── style.css
│   ├── img
│   │   ├── monster1.png
│   │   ├── monster2.png
│   │   ├── monster3.png
│   │   ├── monster4.png
│   ├── js
│   │   ├── allianceDetails.js
│   │   ├── getCurrentURL.js
│   │   ├── leaderboard.js
│   │   ├── levelUp.js
│   │   ├── loginUser.js
│   │   ├── profile.js
│   │   ├── queryCmds.js
│   │   ├── registerUser.js
│   │   ├── showAllAlliances.js
│   │   ├── showAllChallenges.js
│   │   ├── showAllMonsters.js
│   │   ├── showAllQuests.js
│   │   ├── showAllRecipes.js
│   │   ├── showAllTrades.js
│   │   ├── showAllUsers.js
│   │   ├── showChallengeDetails.js
│   │   ├── showChart.js
│   │   ├── showInventory.js
│   │   ├── showToast.js
│   │   ├── showUserDetails.js
│   │   ├── stats.js
│   │   ├── userChallenges.js
│   │   ├── userNavbarToggle.js
├── src
│   ├── app.js
│   ├── configs
│   │   ├── initTables.js
│   ├── controllers
│   │   ├── allianceController.js
│   │   ├── challengeController.js
│   │   ├── craftingController.js
│   │   ├── equipmentController.js
│   │   ├── inventoryController.js
│   │   ├── itemController.js
│   │   ├── monsterController.js
│   │   ├── questController.js
│   │   ├── tradingController.js
│   │   ├── userController.js
│   ├── middlewares
│   │   ├── bcryptMiddleware.js
│   │   ├── jwtMiddleware.js
│   ├── models
│   │   ├── allianceModel.js
│   │   ├── challengeModel.js
│   │   ├── craftingModel.js
│   │   ├── equipmentModel.js
│   │   ├── inventoryModel.js
│   │   ├── itemModel.js
│   │   ├── monsterModel.js
│   │   ├── questModel.js
│   │   ├── tradingModel.js
│   │   ├── userModel.js
│   ├── routes
│   │   ├── allianceRoutes.js
│   │   ├── challengeRoutes.js
│   │   ├── craftingRoutes.js
│   │   ├── equipmentRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── itemRoutes.js
│   │   ├── mainRoutes.js
│   │   ├── monsterRoutes.js
│   │   ├── questRoutes.js
│   │   ├── tradingRoutes.js
│   │   ├── userRoutes.js
│   ├── services
│   │   ├── db.js
```
---
## Project Overview
This project consists of multiple components for handling users, alliances, challenges, inventory, trading, and more. The folder structure follows a clear separation of concerns:
- **public/**: Contains frontend HTML, CSS, images, and JavaScript.
- **src/**: Backend source code, including controllers, models, routes, and middleware.
- **configs/**: Database initialization and setup.
- **middlewares/**: Middleware for authentication and encryption.
- **controllers/**: Handles the logic for various features.
- **models/**: Defines database models.
- **routes/**: Manages API endpoints.
- **services/**: Manages database connections and utilities.
---
## Getting Started
### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- A database (MySQL, PostgreSQL, etc.)
---
### Installation
1. Open the terminal using `` Ctrl + ` `` (backtick).
2. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/bed-ca2-Jenjenson-main.git
   ```
3. Navigate to the project directory:
   ```sh
   cd bed-ca2-Jenjenson-main
   ```
4. Install dependencies:
   ```sh
   npm install
   ```
   Required scripts and dependencies:
   ```json
    {
        "scripts": {
        "init_tables": "node src/configs/initTables.js",
        "dev": "nodemon index.js",
        "start": "node index.js"
        },
        "dependencies": {
        "bcrypt": "^5.1.1",
        "concurrently": "^8.2.0",
        "dotenv": "^16.4.7",
        "express": "^4.21.2",
        "jsonwebtoken": "^9.0.2",
        "mysql2": "^3.12.0",
        "nodemon": "^3.1.9",
        }
    }
   ```
5. Set up environment variables:
   - Create a file named `.env` in the root directory.
   - Add the following lines:
     ```sh
     DB_HOST=<your_database_host>
     DB_USER=<your_database_user>
     DB_PASSWORD=<your_database_password>
     DB_DATABASE=<your_database_name>
     JWT_SECRET_KEY=<your_secret_key>
     JWT_EXPIRES_IN=<duration>
     JWT_ALGORITHM=<selected_algorithm>
     ```
   - Replace placeholders with appropriate values.
   - Example:
     ```sh
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=root
     DB_DATABASE=CA2
     JWT_SECRET_KEY=your-secret-key
     JWT_EXPIRES_IN=24h
     JWT_ALGORITHM=HS256
     ```
     Above is an example of my .env file, you may copy it for the same results
---
## How to Run the Application
Follow these steps to set up and run the application:

### Initialize Database Tables:
Run the following command to create and initialize the database tables:
```sh
npm run init_tables
```

### Run the Application in Development Mode:
Use this command to start the application in development mode (auto-updates on file changes):
```sh
npm run dev
```

### Run the Application in Production Mode:
Start the application in its current state:
```sh
npm start
```

### Stop the Application:
Use `Ctrl + C` in the terminal to stop the running application.


