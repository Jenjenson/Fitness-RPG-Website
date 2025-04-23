const pool = require('../services/db');

// Insert a new challenge into the database
module.exports.insertChallenge = (data, callback) => {
    const SQL = 'INSERT INTO FitnessChallenge (challenge, creator_id, skillpoints) VALUES (?, ?, ?)';
    pool.query(SQL, [data.challenge, data.creator_id, data.skillpoints], callback);
};

// Retrieve all challenges from the database
module.exports.selectAllChallenges = (callback) => {
    const SQL = 'SELECT challenge_id, challenge, creator_id, skillpoints FROM FitnessChallenge';
    pool.query(SQL, callback);
};

// Update Challenge By ID
module.exports.updateChallenge = (data, callback) => {
    const SQL = 'UPDATE FitnessChallenge SET challenge = ?, skillpoints = ? WHERE challenge_id = ?';
    pool.query(SQL, [data.challenge, data.skillpoints, data.challenge_id], callback);
};

// Retrieve a specific challenge by its ID, along with its average rating
module.exports.getChallengeById = (challenge_id, callback) => {
    const SQL = `
        SELECT 
            fc.*, 
            COALESCE(AVG(CASE WHEN uc.rating != 0 THEN uc.rating END), 0) AS average_rating
        FROM 
            FitnessChallenge fc
        LEFT JOIN 
            UserCompletion uc 
            ON fc.challenge_id = uc.challenge_id
        WHERE 
            fc.challenge_id = ?
    `;
    pool.query(SQL, [challenge_id], callback);
};

// Update an existing challenge's details
module.exports.updateChallenge = (data, callback) => {
    const SQL = 'UPDATE FitnessChallenge SET challenge = ?, skillpoints = ? WHERE challenge_id = ?';
    pool.query(SQL, [data.challenge, data.skillpoints, data.challenge_id], callback);
};

// Delete a specific challenge from the database by its ID
module.exports.deleteChallengeById = (challenge_id, callback) => {
    const SQL = 'DELETE FROM FitnessChallenge WHERE challenge_id = ?';
    pool.query(SQL, [challenge_id], callback);
};

// Delete a user's completion record for a specific challenge
module.exports.deleteUserCompletionById = (challenge_id, callback) => {
    const SQL  = 'DELETE FROM UserCompletion WHERE challenge_id = ?';
    pool.query(SQL, [challenge_id], callback);
};

// Insert a record for a user's completion of a challenge
module.exports.insertCompletion = (data, callback) => {
    const SQL = 'INSERT INTO UserCompletion (challenge_id, user_id, completed, creation_date, notes) VALUES (?, ?, ?, ?, ?)';
    pool.query(SQL, [data.challenge_id, data.user_id, data.completed, data.creation_date, data.notes, data.skillpoints], callback);
};

// Retrieve all completions for a specific challenge
module.exports.getCompletionsByChallengeId = (challenge_id, callback) => {
    const SQL = `SELECT user_id, completed, creation_date, notes, rating 
    FROM UserCompletion 
    WHERE challenge_id = ? AND completed= true AND rating != 0`;
    pool.query(SQL, [challenge_id], callback);
};

// Retrieve the total count of completed challenges
module.exports.sumCompletion = (callback) => {
    const SQL = `SELECT COUNT(*) AS completed_count
                 FROM UserCompletion
                 WHERE completed = true;`;
    pool.query(SQL, callback);
};

// Categorize challenges for a specific user based on their completion status and ratings
module.exports.categoriseChallenges = (user_id, callback) => {
    const SQL = `
            SELECT 
            fc.challenge_id,
            fc.challenge,
            fc.skillpoints,
            fc.creator_id
        FROM 
            FitnessChallenge fc
        ORDER BY 
            fc.challenge_id;

        -- Retrieve all fitness challenge attempts for a user, including multiple instances
        SELECT 
            fc.challenge_id,
            uc.completed AS user_completed -- Keep all instances of completion status
        FROM 
            FitnessChallenge fc
        LEFT JOIN 
            UserCompletion uc 
            ON fc.challenge_id = uc.challenge_id AND uc.user_id = ? -- Get all user attempts
        ORDER BY 
            fc.challenge_id, uc.completed; -- Order by challenge and status


        -- Select average rating, excluding ratings of 0
        SELECT 
            fc.challenge_id,
            COALESCE(AVG(CASE WHEN uc.rating != 0 THEN uc.rating END), NULL) AS average_rating
        FROM 
            FitnessChallenge fc
        LEFT JOIN 
            UserCompletion uc 
            ON fc.challenge_id = uc.challenge_id
        GROUP BY 
            fc.challenge_id;
    ;
    `;
    
    pool.query(SQL, [user_id], callback);
};


// Accept a challenge by setting its status to 'In Progress'
module.exports.acceptChallenge = (data, callback) => {
    const SQL = `
    -- Accept a challenge (set 'completed' to FALSE if it has not been taken yet)
    INSERT INTO UserCompletion (challenge_id, user_id, completed)
    VALUES (?, ?, FALSE)  -- Mark the challenge as In Progress (accepted)
    ON DUPLICATE KEY UPDATE
        completed = IFNULL(completed, FALSE); -- If record exists, only update if not yet accepted
    `;
    pool.query(SQL, [data.challenge_id, data.user_id], callback);
};

// Mark a challenge as completed for a user and update their skillpoints
module.exports.completeChallenge = (data, callback) => {
    const SQL = `
        -- Update User skillpoints
        UPDATE User u
        JOIN FitnessChallenge fc ON fc.challenge_id = ?
        SET u.skillpoints = u.skillpoints + fc.skillpoints
        WHERE u.user_id = ?;

        -- Update UserCompletion to mark as completed
        UPDATE UserCompletion uc
        SET uc.completed = TRUE
        WHERE uc.user_id = ? AND uc.challenge_id = ?;
    `;
    pool.query(SQL, [data.challenge_id, data.user_id, data.user_id, data.challenge_id], callback);
};

// Update a user's review for a completed challenge
module.exports.updateReview = (data, callback) => {
    const SQL = `
        UPDATE UserCompletion
        SET rating = ?, notes = ?, creation_date = CURRENT_TIMESTAMP
        WHERE user_id = ? AND challenge_id = ?
        ORDER BY complete_id ASC
        LIMIT 1;
    `;
    pool.query(SQL, [data.rating, data.notes, data.user_id, data.challenge_id], callback);
};

// Retrieve the total number of completions for a specific challenge
module.exports.completionsByChallengeId = (data, callback) => {
    const SQL = `
        SELECT COUNT(*) AS completion_count
        FROM UserCompletion
        WHERE challenge_id = ? AND completed = true
    `;
    pool.query(SQL, [data.challenge_id], callback);
};

// Add a new challenge
module.exports.insertChallenge = (data, callback) => {
    const SQL = 'INSERT INTO FitnessChallenge (challenge, creator_id, skillpoints) VALUES (?, ?, ?)';
    pool.query(SQL, [data.challenge, data.creator_id, data.skillpoints], callback);
};

// Add a delete challenge
module.exports.deleteChallengeById = (challenge_id, callback) => {
    const SQL = 'DELETE FROM FitnessChallenge WHERE challenge_id = ?';
    pool.query(SQL, [challenge_id], callback);
};