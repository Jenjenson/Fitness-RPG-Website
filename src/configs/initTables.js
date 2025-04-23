const pool = require("../services/db");
const bcrypt = require("bcrypt");
const saltRounds = 10;

// Users to be inserted into the User table
const users = [
  { username: "user1", email: "user1@example.com", password: "password1", skillpoints: 1000 },
  { username: "user2", email: "user2@example.com", password: "password2", skillpoints: 150 },
  { username: "user3", email: "user3@example.com", password: "password3", skillpoints: 200 },
  { username: "user4", email: "user4@example.com", password: "password4", skillpoints: 250 },
  { username: "user5", email: "user5@example.com", password: "password5", skillpoints: 300 },
  { username: "admin", email: "admin@example.com", password: "adminpass1", skillpoints: 99999 },
  { username: "admin2", email: "admin2@example.com", password: "adminpass2", skillpoints: 99999 },
  { username: "admin3", email: "admin3@example.com", password: "adminpass3", skillpoints: 99999 },
  { username: "admin4", email: "admin4@example.com", password: "adminpass4", skillpoints: 99999 },
];

// Array to store hashed users
const hashedUsers = [];

// Hash each user's password
const hashUserPasswords = (index) => {
  if (index >= users.length) {
    // All passwords are hashed, build and execute the SQL statement
    const userInsertValues = hashedUsers
      .map(
        (user) =>
          `('${user.username}', '${user.email}', '${user.password}', ${user.skillpoints})`
      )
      .join(",\n");

    const SQLSTATEMENT = `
    -- Drop Tables in Reverse Dependency Order
    DROP TABLE IF EXISTS Trades;
    DROP TABLE IF EXISTS CraftingRecipes;
    DROP TABLE IF EXISTS Equipment;
    DROP TABLE IF EXISTS Inventory;
    DROP TABLE IF EXISTS AllianceMembers;
    DROP TABLE IF EXISTS Alliance;
    DROP TABLE IF EXISTS QuestMonsters;
    DROP TABLE IF EXISTS UserQuests;
    DROP TABLE IF EXISTS Quests;
    DROP TABLE IF EXISTS Monsters;
    DROP TABLE IF EXISTS Items;
    DROP TABLE IF EXISTS UserCompletion;
    DROP TABLE IF EXISTS FitnessChallenge;
    DROP TABLE IF EXISTS User;

    -- User Table
    CREATE TABLE User (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      skillpoints INT DEFAULT 0,
      level INT DEFAULT 1,
      STR INT DEFAULT 10,
      HP INT DEFAULT 100,
      DEF INT DEFAULT 5
    );

    -- FitnessChallenge Table (Now references User, which is already created)
    CREATE TABLE FitnessChallenge (
      challenge_id INT AUTO_INCREMENT PRIMARY KEY,
      creator_id INT NOT NULL,
      challenge TEXT NOT NULL,
      skillpoints INT NOT NULL,
      FOREIGN KEY (creator_id) REFERENCES User(user_id) ON DELETE CASCADE
    );

    -- UserCompletion Table
    CREATE TABLE UserCompletion (
      complete_id INT AUTO_INCREMENT PRIMARY KEY,
      challenge_id INT NOT NULL,
      user_id INT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      rating INT DEFAULT 0,  -- Rating of 1-5 stars for completed challenges
      FOREIGN KEY (challenge_id) REFERENCES FitnessChallenge(challenge_id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
    );

    -- Alliance Tables
    CREATE TABLE Alliance (
      alliance_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      leader_id INT,
      FOREIGN KEY (leader_id) REFERENCES User(user_id) ON DELETE SET NULL
    );

    CREATE TABLE AllianceMembers (
      member_id INT AUTO_INCREMENT PRIMARY KEY,
      alliance_id INT NOT NULL,
      user_id INT NOT NULL,
      role ENUM('member', 'leader') DEFAULT 'member',
      FOREIGN KEY (alliance_id) REFERENCES Alliance(alliance_id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
    );

    -- Items and Related Tables
    CREATE TABLE Items (
      item_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type ENUM('weapon', 'armor', 'shield', 'accessory') NOT NULL,
      stat_bonus INT DEFAULT 0,
      stat_type ENUM('HP', 'STR', 'DEF', 'none') DEFAULT 'none',
      description TEXT
    );

    CREATE TABLE Inventory (
      inventory_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      item_id INT NOT NULL,
      quantity INT DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE
    );

    CREATE TABLE Equipment (
      equipment_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      item_id INT NOT NULL,
      slot ENUM('armor', 'weapon', 'shield', 'accessory') NOT NULL,
      equipped BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE
    );

    -- Monsters Table
    CREATE TABLE Monsters (
      monster_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      level INT NOT NULL,
      HP INT NOT NULL,
      STR INT NOT NULL,
      DEF INT NOT NULL,
      EXP INT NOT NULL,
      drop_item TEXT NOT NULL,
      drop_item_id INT NOT NULL,
      FOREIGN KEY (drop_item_id) REFERENCES Items(item_id) ON DELETE CASCADE
    );

    -- Quests and Related Tables
    CREATE TABLE Quests (
      quest_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      type ENUM('kill_monsters', 'collect_items', 'explore_area') NOT NULL,
      target_count INT NOT NULL,
      reward_skillpoints INT NOT NULL,
      reward_item_id INT DEFAULT NULL,
      FOREIGN KEY (reward_item_id) REFERENCES Items(item_id) ON DELETE SET NULL
    );

    CREATE TABLE QuestMonsters (
      quest_id INT NOT NULL,
      monster_id INT NOT NULL,
      PRIMARY KEY (quest_id, monster_id),
      FOREIGN KEY (quest_id) REFERENCES Quests(quest_id) ON DELETE CASCADE,
      FOREIGN KEY (monster_id) REFERENCES Monsters(monster_id) ON DELETE CASCADE
    );

    CREATE TABLE UserQuests (
      user_id INT NOT NULL,
      quest_id INT NOT NULL,
      progress INT DEFAULT 0,
      goal INT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      PRIMARY KEY (user_id, quest_id),
      FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
      FOREIGN KEY (quest_id) REFERENCES Quests(quest_id) ON DELETE CASCADE
    );

    -- CraftingRecipes Table
    CREATE TABLE CraftingRecipes (
      recipe_id INT AUTO_INCREMENT PRIMARY KEY,
      crafted_item_id INT NOT NULL,
      ingredient_item_id INT NOT NULL,
      quantity_required INT NOT NULL,
      FOREIGN KEY (crafted_item_id) REFERENCES Items(item_id) ON DELETE CASCADE,
      FOREIGN KEY (ingredient_item_id) REFERENCES Items(item_id) ON DELETE CASCADE
    );
    
    -- Trading Table
    CREATE TABLE Trades (
        trade_id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        recipient_id INT NOT NULL,
        offer_item_id INT NOT NULL,
        offer_quantity INT NOT NULL,
        request_item_id INT NOT NULL,
        request_quantity INT NOT NULL,
        status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
        FOREIGN KEY (sender_id) REFERENCES User(user_id),
        FOREIGN KEY (recipient_id) REFERENCES User(user_id),
        FOREIGN KEY (offer_item_id) REFERENCES Items(item_id),
        FOREIGN KEY (request_item_id) REFERENCES Items(item_id)
    );

      -- Insert Default Users
      INSERT INTO User (username, email, password, skillpoints) VALUES
      ${userInsertValues};

      -- Insert Default Fitness Challenges
      INSERT INTO FitnessChallenge (creator_id, challenge, skillpoints) VALUES
      (1, 'Complete 2.4km within 15 minutes', 50),
      (1, 'Cycle around the island for at least 50km', 100),
      (2, 'Complete a full marathon (42.2km)', 200),
      (2, 'Hold a plank for 5 minutes', 5),
      (2, 'Perform 100 push-ups in one session', 75);

      -- Insert User Completions (example of users completing some challenges)
      INSERT INTO UserCompletion (challenge_id, user_id, completed, notes, rating) VALUES
      (1, 1, true, 'Completed 2.4km in under 15 minutes', 5),
      (2, 1, false, 'Test', 0),
      (3, 2, true, 'Completed a full marathon (42.2km)', 4),
      (4, 3, true, 'Held a plank for 5 minutes', 3),
      (5, 4, true, 'Performed 100 push-ups in one session', 4),
      (2, 5, false, 'Still cycling around the island for 50km', 0);


      -- Insert Default Alliances
      INSERT INTO Alliance (name, description, leader_id) VALUES
      ('Knights of Valor', 'A brave group of warriors.', 1),
      ('Warriors of the North', 'A fierce alliance from the northern lands.', 2);

      -- Insert Alliance Members
      INSERT INTO AllianceMembers (alliance_id, user_id, role) VALUES
      (1, 1, 'leader'),
      (1, 6, 'member'),
      (1, 7, 'member'),
      (2, 2, 'leader'),
      (2, 4, 'member'),
      (2, 5, 'member');

      -- Insert Items
      INSERT INTO Items (name, type, stat_bonus, stat_type, description) VALUES
      ('Slime Jelly', 'accessory', 0, 'none', 'A gooey substance that oozes from slimes. Used for crafting or healing.'),
      ('Iron Sword', 'weapon', 10, 'STR', 'A sturdy iron sword that increases attack power.'),
      ('Steel Shield', 'shield', 15, 'DEF', 'A solid steel shield that boosts defense.'),
      ('Leather Armor', 'armor', 5, 'DEF', 'Light armor that slightly improves defense.'),
      ('Amulet of Strength', 'accessory', 20, 'STR', 'A magical amulet that boosts strength.'),
      ('Small Coin', 'accessory', 0, 'none', 'A small coin used for crafting.'),
      ('Lucky Coin', 'accessory', 25, 'HP', 'A lucky coin that boosts health, craftable with 5 small coins.'),
      ('Dragon Scale', 'accessory', 0, 'none', 'A rare scale from a dragon.'),
      ('Dragon Scale Armor', 'armor', 75, 'DEF', 'An armor forged from Dragon Scale.'),
      ('Dragon Steel Sword', 'weapon', 75, 'STR', 'An armor forged from Dragon Steel.');

      -- Insert Crafting Recipes
      INSERT INTO CraftingRecipes (crafted_item_id, ingredient_item_id, quantity_required) VALUES
      ((SELECT item_id FROM Items WHERE name = 'Lucky Coin'), (SELECT item_id FROM Items WHERE name = 'Small Coin'), 5),
      ((SELECT item_id FROM Items WHERE name = 'Dragon Scale Armor'), (SELECT item_id FROM Items WHERE name = 'Dragon Scale'), 10);

      -- Insert Inventory
      INSERT INTO Inventory (user_id, item_id, quantity) VALUES
      (2, (SELECT item_id FROM Items WHERE name = 'Steel Shield'), 1),
      (6, (SELECT item_id FROM Items WHERE name = 'Dragon Scale'), 10),
      (6, (SELECT item_id FROM Items WHERE name = 'Small Coin'), 5);

      -- Give User 1 all items (for testing)
      INSERT INTO Inventory (user_id, item_id, quantity) 
      SELECT 1, item_id, 1
      FROM Items;

      -- Insert Monsters
      INSERT INTO Monsters (name, level, HP, STR, DEF, EXP, drop_item, drop_item_id) VALUES
      ('Slime', 1, 25, 1, 1, 20, 'Slime Jelly', (SELECT item_id FROM Items WHERE name = 'Slime Jelly')),
      ('Goblin', 5, 50, 5, 2, 30, 'Small Coin', (SELECT item_id FROM Items WHERE name = 'Small Coin')),
      ('Orc', 10, 200, 15, 10, 50, 'Iron Sword', (SELECT item_id FROM Items WHERE name = 'Iron Sword')),
      ('Dragon', 25, 500, 40, 25, 200, 'Dragon Scale', (SELECT item_id FROM Items WHERE name = 'Dragon Scale'));

      -- Insert Sample Quests
      INSERT INTO Quests (name, description, type, target_count, reward_skillpoints, reward_item_id) VALUES
      ('Slime Slayer', 'Defeat 5 Slimes to protect the village.', 'kill_monsters', 5, 50, NULL),
      ('Goblin Hunter', 'Defeat 3 Goblins in the forest.', 'kill_monsters', 3, 75, (SELECT item_id FROM Items WHERE name = 'Steel Shield')),
      ('Dragon Slayer', 'Defeat 1 Dragon to prove your might.', 'kill_monsters', 1, 200, (SELECT item_id FROM Items WHERE name = 'Dragon Steel Sword'));

      -- Assign Quests to Users
      INSERT INTO UserQuests (user_id, quest_id, progress, goal, completed) VALUES
      (1, (SELECT quest_id FROM Quests WHERE name = 'Slime Slayer'), 0, (SELECT target_count FROM Quests WHERE name = 'Slime Slayer'), FALSE),
      (2, (SELECT quest_id FROM Quests WHERE name = 'Goblin Hunter'), 0, (SELECT target_count FROM Quests WHERE name = 'Goblin Hunter'), FALSE),
      (2, (SELECT quest_id FROM Quests WHERE name = 'Dragon Slayer'), 0, (SELECT target_count FROM Quests WHERE name = 'Dragon Slayer'), FALSE);

      -- Inserting a quest-monster relationship
      INSERT INTO QuestMonsters (quest_id, monster_id)
      VALUES 
          (1, 1),
          (2, 2),
          (3, 4);
          `;

    pool.query(SQLSTATEMENT, (error, results) => {
      if (error) {
        console.error("Error creating tables and inserting data:", error);
      } else {
        console.log("Tables and data created successfully.");
      }
      process.exit();
    });
    return;
  }

  // Hash the password of the current user
  const user = users[index];
  bcrypt.hash(user.password, saltRounds, (error, hash) => {
    if (error) {
      console.error("Error hashing password for user:", user.username, error);
      process.exit(1);
    } else {
      console.log(`Password hashed for user: ${user.username}`);
      hashedUsers.push({ ...user, password: hash });
      hashUserPasswords(index + 1); // Proceed to the next user
    }
  });
};

// Start hashing passwords
hashUserPasswords(0);
