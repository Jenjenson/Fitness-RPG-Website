const pool = require('../services/db');

// Get all available quests
module.exports.getAllQuests = (callback) => {
    const SQLSTATEMENT = `SELECT * FROM Quests;`;
    pool.query(SQLSTATEMENT, callback);
};

// Assign a quest to a user
module.exports.assignQuestToUser = (user_id, quest_id, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO UserQuests (user_id, quest_id, progress, goal, completed) 
        SELECT ?, ?, 0, target_count, FALSE
        FROM Quests
        WHERE quest_id = ?
        ON DUPLICATE KEY UPDATE progress = progress;
    `;
    pool.query(SQLSTATEMENT, [user_id, quest_id, quest_id], callback);
};

// Update user quest progress
module.exports.updateQuestProgress = (user_id, quest_id, progress, callback) => {
    const SQLSTATEMENT = `
        UPDATE UserQuests 
        SET progress = GREATEST(0, LEAST(target_count, progress + ?)) 
        WHERE user_id = ? AND quest_id = ?;
    `;
    pool.query(SQLSTATEMENT, [progress, user_id, quest_id], callback);
};

// Complete a quest
module.exports.completeQuest = (user_id, quest_id, callback) => {
    const SQLSTATEMENT = `
        UPDATE UserQuests 
        SET completed = TRUE 
        WHERE user_id = ? AND quest_id = ?;
    `;
    pool.query(SQLSTATEMENT, [user_id, quest_id], callback);
};

// Get all quests assigned to a specific user
module.exports.getUserQuests = (user_id, callback) => {
    const SQLSTATEMENT = `
        SELECT uq.quest_id, q.name, q.description, uq.progress, q.target_count, uq.completed
        FROM UserQuests uq
        JOIN Quests q ON uq.quest_id = q.quest_id
        WHERE uq.user_id = ?;
    `;
    pool.query(SQLSTATEMENT, [user_id], callback);
};

// Get specific quest
module.exports.getQuestsById = (quest_id, callback) => {
    const SQLSTATEMENT = `
        SELECT * FROM Quests
        WHERE quest_id = ?
    ;`;
    pool.query(SQLSTATEMENT, quest_id, callback);
};

// Categorise Quests
module.exports.categoriseQuests = (user_id, callback) => {
    const SQL = `
        -- Retrieve all quests, their progress, and categorize them
        SELECT 
            q.quest_id,
            q.name,
            q.description,
            q.target_count,
            q.reward_skillpoints,  -- Include reward skill points
            i.name AS reward_item_name, -- Include reward item name
            uq.progress,
            uq.completed,
            COUNT(CASE WHEN uq.completed = TRUE THEN 1 END) AS completions, -- Number of completions
            CASE
                WHEN uq.quest_id IS NULL THEN 0  -- Not Taken quests come first
                WHEN uq.completed = FALSE THEN 1 -- In Progress quests
                ELSE 2                           -- Completed quests come last
            END AS quest_status
        FROM 
            Quests q
        LEFT JOIN 
            UserQuests uq 
            ON q.quest_id = uq.quest_id AND uq.user_id = ?  -- Ensure we match the user_id
        LEFT JOIN 
            Items i
            ON q.reward_item_id = i.item_id  -- Join with Items table to get the item name
        GROUP BY
            q.quest_id, q.name, q.description, q.target_count, q.reward_skillpoints, 
            i.name, uq.progress, uq.completed
        ORDER BY 
            quest_status;
    `;

    pool.query(SQL, [user_id], callback);
};

