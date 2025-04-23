// Import database pool connection
const pool = require('../services/db');
const inventoryModel = require('./inventoryModel');

// Get all monster info
module.exports.getAllMonsters = (callback) => {
    const SQLSTATEMENT = `
        SELECT *
        FROM Monsters;
    `;
    
    pool.query(SQLSTATEMENT, callback);
};

// Get monster info by monster_id
module.exports.getMonsterById = (monster_id, callback) => {
    const SQLSTATEMENT = `
        SELECT *
        FROM Monsters
        WHERE monster_id = ?;
    `;
    
    pool.query(SQLSTATEMENT, [monster_id], callback);
};

// Get a random monster (for random encounters)
module.exports.getRandomMonster = (callback) => {
    const SQLSTATEMENT = `
        SELECT *
        FROM Monsters
        ORDER BY RAND()
        LIMIT 1;
    `;
    
    pool.query(SQLSTATEMENT, callback);
};

// Get user data by user id
module.exports.getUserData = (user_id, callback) => {  // Accept user_id as a parameter
    const SQLSTATEMENT = `
        SELECT *
        FROM User
        WHERE user_id = ?;
    `;
    pool.query(SQLSTATEMENT, [user_id], callback);  // Use user_id in the query
};

// Get monster data by monster id
module.exports.getMonsterData = (monster_id, callback) => {  // Accept monster_id as a parameter
    const SQLSTATEMENT = `
        SELECT *
        FROM Monsters
        WHERE monster_id = ?;
    `;
    pool.query(SQLSTATEMENT, [monster_id], callback);  // Use monster_id in the query
};

// Update user skillpoints
module.exports.updateUserXP = (user_id, newXP, callback) => {
    const SQLSTATEMENT = `
        UPDATE User
        SET skillpoints = ?
        WHERE user_id = ?;
    `;
    pool.query(SQLSTATEMENT, [newXP, user_id], callback);
};

// Get Item by Id
module.exports.getItemById = (item_id, callback) => {
    const SQLSTATEMENT = `
    SELECT *
    FROM Items
    WHERE item_id = ?
    `
    pool.query(SQLSTATEMENT, [item_id], callback);
}

// Update Quest Progress If Needed
module.exports.updateQuestProgress = (user_id, monster_id, callback) => {
    // Step 1: Increment the quest progress by 1
    const updateProgressSQL = `
        UPDATE UserQuests uq
        SET uq.progress = uq.progress + 1
        WHERE uq.user_id = ? 
        AND uq.quest_id IN (
            SELECT qm.quest_id 
            FROM QuestMonsters qm 
            WHERE qm.monster_id = ? 
        ) 
        AND uq.progress < uq.goal;
    `;

    pool.query(updateProgressSQL, [user_id, monster_id], (error, result) => {
        if (error) {
            console.error("Error updating quest progress:", error);
            return callback(error);
        }

        // Step 2: Check if the quest is completed (progress >= goal)
        const checkCompletionSQL = `
            SELECT uq.completed, uq.quest_id, uq.progress, uq.goal
            FROM UserQuests uq
            WHERE uq.user_id = ? 
            AND uq.quest_id IN (
                SELECT qm.quest_id
                FROM QuestMonsters qm
                WHERE qm.monster_id = ?
            )
        `;
        
        pool.query(checkCompletionSQL, [user_id, monster_id], (completionError, completionResult) => {
            if (completionError) {
                console.error("Error checking quest completion:", completionError);
                return callback(completionError);
            }

            // If no quest is found for this user and monster, we allow the fight to proceed
            if (completionResult.length === 0) {
                return callback(null); // Allow fighting the monster without quest-related logic
            }

            const quest = completionResult[0];

            // If the quest is completed, no reward should be granted again
            if (quest.completed) {
                return callback(null); // No reward, quest already completed
            }

            // Step 3: Mark quest as completed if progress >= goal
            if (quest.progress >= quest.goal) {
                const markCompletedSQL = `
                    UPDATE UserQuests
                    SET completed = TRUE
                    WHERE user_id = ? 
                    AND quest_id IN (
                        SELECT qm.quest_id
                        FROM QuestMonsters qm
                        WHERE qm.monster_id = ?
                    );
                `;
                
                pool.query(markCompletedSQL, [user_id, monster_id], (markCompletionError) => {
                    if (markCompletionError) {
                        console.error("Error marking quest as completed:", markCompletionError);
                        return callback(markCompletionError);
                    }

                    // Step 4: Fetch quest rewards (skill points and item)
                    const getQuestRewardSQL = `
                        SELECT reward_skillpoints, reward_item_id
                        FROM Quests
                        WHERE quest_id IN (
                            SELECT qm.quest_id
                            FROM QuestMonsters qm
                            WHERE qm.monster_id = ?
                        );
                    `;
                    
                    pool.query(getQuestRewardSQL, [monster_id], (rewardError, rewardResult) => {
                        if (rewardError) {
                            console.error("Error fetching quest rewards:", rewardError);
                            return callback(rewardError);
                        }

                        // Ensure quest reward data exists
                        const rewardSkillpoints = rewardResult[0] ? rewardResult[0].reward_skillpoints : 0;
                        const rewardItemId = rewardResult[0] ? rewardResult[0].reward_item_id : null;

                        // Step 5: Add skill points to the user
                        const updateSkillpointsSQL = `
                            UPDATE User
                            SET skillpoints = skillpoints + ?
                            WHERE user_id = ?;
                        `;
                        
                        pool.query(updateSkillpointsSQL, [rewardSkillpoints, user_id], (skillpointsError) => {
                            if (skillpointsError) {
                                console.error("Error updating skillpoints:", skillpointsError);
                                return callback(skillpointsError);
                            }

                            // Step 6: If there's a reward item, add it to the user's inventory
                            if (rewardItemId) {
                                inventoryModel.addItemToInventory({ user_id, item_id: rewardItemId, quantity: 1 }, (inventoryError) => {
                                    if (inventoryError) {
                                        console.error("Error adding item to inventory:", inventoryError);
                                        return callback(inventoryError);
                                    }
                                
                                    callback(null);
                                });
                            } else {
                                // No item dropped, just complete the quest and update skillpoints
                                callback(null);
                            }
                        });
                    });
                });
            } else {
                // Quest not completed yet, just return
                callback(null);
            }
        });
    });
};