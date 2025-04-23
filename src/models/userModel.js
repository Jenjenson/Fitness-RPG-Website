const pool = require('../services/db');

// Check if username already exists
module.exports.findByUsername = (username, callback) => {
    const SQLSTATEMENT = `SELECT * FROM User WHERE username = ?;`;
    pool.query(SQLSTATEMENT, [username], callback);
};

// Create a new user
module.exports.createUser = (data, callback) => {
    const SQLSTATEMENT = `INSERT INTO User (username, skillpoints) VALUES (?, 0);`;
    pool.query(SQLSTATEMENT, [data.username], callback);
};

// Get all users
module.exports.getAllUsers = (callback) => {
    const SQLSTATEMENT = `
        SELECT 
            u.user_id, 
            u.username, 
            u.skillpoints, 
            u.level, 
            u.STR, 
            u.HP, 
            u.DEF, 
            a.name AS alliance
        FROM User u
        LEFT JOIN AllianceMembers am ON u.user_id = am.user_id
        LEFT JOIN Alliance a ON am.alliance_id = a.alliance_id;
    `;
    pool.query(SQLSTATEMENT, callback);
};


// Get user by ID
module.exports.findUserById = (user_id, callback) => {
    const SQLSTATEMENT = `
        SELECT 
            u.*, 
            a.name AS alliance_name
        FROM User u
        LEFT JOIN AllianceMembers am ON u.user_id = am.user_id
        LEFT JOIN Alliance a ON am.alliance_id = a.alliance_id
        WHERE u.user_id = ?;
    `;
    pool.query(SQLSTATEMENT, [user_id], callback);
};

// Update a user by ID
module.exports.updateUsernameUserById = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE User
        SET username = ?
        WHERE user_id = ?;
    `;
    pool.query(SQLSTATEMENT, [data.username, data.user_id], callback);
};

// Increase a user's skillpoints
module.exports.increaseSkillpoints = (user_id, increment_value, callback) => {
    const SQLSTATEMENT = `UPDATE User 
    SET skillpoints = skillpoints + ? 
    WHERE user_id = ?`;
    pool.query(SQLSTATEMENT, [increment_value, user_id], callback);
};

// Assigns Challenge to User
module.exports.assignChallengeToUser = (challengeId, userId, callback) => {
    const assignQuery = `
        INSERT INTO UserCompletion (challenge_id, user_id, completed, notes)
        VALUES (?, ?, false, NULL)
    `;
    pool.query(assignQuery, [challengeId, userId], (err) => {
        if (err) {
            return callback(err, null);
        }
        callback(null);
    });
};

// Level Up mechanic: Level up, gain stats and lose skillpoints
module.exports.increaseLevel = (user_id, callback) => {
    const SQLSTATEMENT = `
    UPDATE User
    SET 
        level = level + 1,
        STR = STR + 2,
        HP = HP + 10,
        DEF = DEF + 1,
        skillpoints = skillpoints - (50 * POWER(2, level - 2))
    WHERE user_id = ? AND skillpoints >= (50 * POWER(2, level - 1));
  `;
    pool.query(SQLSTATEMENT, [user_id], callback);
};

module.exports.insertSingle = (data, callback) => {
    const SQLSTATEMENT = `INSERT INTO User (username, email, password) VALUES (?, ?, ?);`;
    pool.query(SQLSTATEMENT, [data.username, data.email, data.password], callback);
};

//////////////////////////////////////////////////////
// SELECT USER BY USERNAME
//////////////////////////////////////////////////////

module.exports.selectUserByUsername = (data, callback) => {
    const SQLSTATMENT = `SELECT * FROM user
      WHERE username = ?;
      `;
    const VALUES = [data.username];
    pool.query(SQLSTATMENT, VALUES, callback);
  };
  
//////////////////////////////////////////////////////
// SELECT USER BY USERNAME OR EMAIL
//////////////////////////////////////////////////////

module.exports.selectUserByUsernameOrEmail = (data, callback) => {
    const SQLSTATMENT = `
    SELECT * FROM USER
    WHERE username = ?
    OR email = ?;
    `;
    const VALUES = [data.username, data.email];
    pool.query(SQLSTATMENT, VALUES, callback);
};

//////////////////////////////////////////////////////
// SELECT TOP 5 USERS
//////////////////////////////////////////////////////
module.exports.selectTop5Users = (callback) => {
    const SQLSTATEMENT = `
    SELECT u.*, 
           COALESCE(uc.completed_count, 0) AS total_completed_challenges
    FROM User u
    LEFT JOIN (
        SELECT user_id, COUNT(*) AS completed_count
        FROM UserCompletion
        WHERE completed = TRUE
        GROUP BY user_id
    ) uc ON u.user_id = uc.user_id
    ORDER BY u.level DESC, u.skillpoints DESC, total_completed_challenges DESC
    LIMIT 5;
    `;
    
    pool.query(SQLSTATEMENT, callback);
};

//////////////////////////////////////////////////////
// SELECT COUNT USERS
//////////////////////////////////////////////////////
module.exports.totalUsers = (callback) => {
    const SQLSTATEMENT = `SELECT COUNT(*) AS totalUsers
                 FROM User;`;
    pool.query(SQLSTATEMENT, callback);
};

//////////////////////////////////////////////////////
// SELECT USER FITNESS CHALLENGES
//////////////////////////////////////////////////////
module.exports.getUserCompletionById = (userId, callback) => {
    const SQLSTATEMENT = `
        SELECT 
            uc.*, 
            fc.challenge AS challenge_name,
            fc.skillpoints
        FROM UserCompletion uc
        JOIN FitnessChallenge fc ON uc.challenge_id = fc.challenge_id
        WHERE uc.user_id = ?;
    `;
    pool.query(SQLSTATEMENT, [userId], callback);
};

//////////////////////////////////////////////////////
// SELECT USER FITNESS CHALLENGES COMPLETIONS
//////////////////////////////////////////////////////
module.exports.getUserCountChallengeCompletions = (userId, callback) => {
    const SQLSTATEMENT = `
        SELECT 
            SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) AS completed,
            SUM(CASE WHEN completed = false THEN 1 ELSE 0 END) AS incomplete
        FROM UserCompletion
        WHERE user_id = ?;
    `;
    pool.query(SQLSTATEMENT, [userId], callback);
};

//////////////////////////////////////////////////////
// SELECT USER QUESTS COMPLETIONS
//////////////////////////////////////////////////////
module.exports.getUserCountQuestsCompletions = (userId, callback) => {
    const SQLSTATEMENT = `
        SELECT 
            SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) AS completed,
            SUM(CASE WHEN completed = false THEN 1 ELSE 0 END) AS incomplete
        FROM UserQuests
        WHERE user_id = ?;
    `;
    pool.query(SQLSTATEMENT, [userId], callback);
};