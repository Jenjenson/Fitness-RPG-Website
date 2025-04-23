const pool = require('../services/db');

// Function to check if user has an equipped item of a slot
module.exports.checkEquippedItemType = (user_id, slot, callback) => {
    const SQLSTATEMENT = `
        SELECT e.equipment_id, e.item_id
        FROM Equipment e
        JOIN Items i ON e.item_id = i.item_id
        WHERE e.user_id = ? AND i.type = ? AND e.equipped = true;
    `;
    pool.query(SQLSTATEMENT, [user_id, slot], callback);
};

// Function to Equip Item and Update User's Stats
module.exports.equipItemAndUpdateStats = (user_id, item_id, slot, callback) => {
    pool.getConnection((err, connection) => {
        if (err) return callback(err);

        connection.beginTransaction((transactionError) => {
            if (transactionError) {
                connection.release();
                return callback(transactionError);
            }

            // Step 1: Update User Stats
            const updateUserStatsQuery = `
                UPDATE User
                JOIN Items item ON item.item_id = ?
                SET 
                    User.HP = User.HP + IF(item.stat_type = 'HP', item.stat_bonus, 0),
                    User.STR = User.STR + IF(item.stat_type = 'STR', item.stat_bonus, 0),
                    User.DEF = User.DEF + IF(item.stat_type = 'DEF', item.stat_bonus, 0)
                WHERE User.user_id = ?;
            `;

            connection.query(updateUserStatsQuery, [item_id, user_id], (updateError) => {
                if (updateError) return connection.rollback(() => callback(updateError));

                // Step 2: Equip item in Equipment table
                const equipItemQuery = `
                    INSERT INTO Equipment (user_id, item_id, slot, equipped) 
                    VALUES (?, ?, ?, true);
                `;

                connection.query(equipItemQuery, [user_id, item_id, slot], (equipError) => {
                    if (equipError) return connection.rollback(() => callback(equipError));

                    // Step 3: Reduce inventory count
                    const reduceInventoryQuery = `
                        UPDATE Inventory 
                        SET quantity = quantity - 1 
                        WHERE user_id = ? AND item_id = ?;
                    `;

                    connection.query(reduceInventoryQuery, [user_id, item_id], (reduceError, result) => {
                        if (reduceError || result.affectedRows === 0) {
                            return connection.rollback(() => callback(reduceError || new Error("Item not found in inventory")));
                        }

                        connection.commit((commitError) => {
                            if (commitError) return connection.rollback(() => callback(commitError));

                            connection.release();
                            callback(null, "Item equipped successfully.");
                        });
                    });
                });
            });
        });
    });
};

// Function to unequip item and Update Stats
module.exports.unequipItem = (equipment_id, callback) => {
    pool.getConnection((err, connection) => {
        if (err) return callback(err);

        connection.beginTransaction((transactionError) => {
            if (transactionError) {
                connection.release();
                return callback(transactionError);
            }

            // Step 1: Get user_id and item_id from Equipment
            const getItemQuery = `SELECT user_id, item_id FROM Equipment WHERE equipment_id = ?;`;

            connection.query(getItemQuery, [equipment_id], (getItemError, results) => {
                if (getItemError || results.length === 0) {
                    return connection.rollback(() => callback(getItemError || new Error("Equipment not found")));
                }

                const { user_id, item_id } = results[0];

                // Step 2: Update user stats
                const updateUserStatsQuery = `
                    UPDATE User
                    JOIN Items item ON item.item_id = ?
                    SET 
                        User.HP = User.HP - IF(item.stat_type = 'HP', item.stat_bonus, 0),
                        User.STR = User.STR - IF(item.stat_type = 'STR', item.stat_bonus, 0),
                        User.DEF = User.DEF - IF(item.stat_type = 'DEF', item.stat_bonus, 0)
                    WHERE User.user_id = ?;
                `;

                connection.query(updateUserStatsQuery, [item_id, user_id], (updateError) => {
                    if (updateError) return connection.rollback(() => callback(updateError));

                    // Step 3: Remove from Equipment table
                    const unequipItemQuery = `DELETE FROM Equipment WHERE equipment_id = ?;`;

                    connection.query(unequipItemQuery, [equipment_id], (unequipError) => {
                        if (unequipError) return connection.rollback(() => callback(unequipError));

                        // Step 4: Update Inventory (add back item and increase quantity)
                        const checkInventoryQuery = `
                            SELECT quantity FROM Inventory WHERE user_id = ? AND item_id = ?;
                        `;
                        connection.query(checkInventoryQuery, [user_id, item_id], (checkError, checkResults) => {
                            if (checkError) return connection.rollback(() => callback(checkError));

                            if (checkResults.length > 0) {
                                // Item exists, update quantity
                                const updateQuantityQuery = `
                                    UPDATE Inventory 
                                    SET quantity = quantity + 1 
                                    WHERE user_id = ? AND item_id = ?;
                                `;
                                connection.query(updateQuantityQuery, [user_id, item_id], (updateError) => {
                                    if (updateError) return connection.rollback(() => callback(updateError));

                                    connection.commit((commitError) => {
                                        if (commitError) return connection.rollback(() => callback(commitError));

                                        connection.release();
                                        callback(null, "Item unequipped and quantity updated.");
                                    });
                                });
                            } else {
                                // Item does not exist, insert a new row
                                const insertInventoryQuery = `
                                    INSERT INTO Inventory (user_id, item_id, quantity) 
                                    VALUES (?, ?, 1);
                                `;
                                connection.query(insertInventoryQuery, [user_id, item_id], (insertError) => {
                                    if (insertError) return connection.rollback(() => callback(insertError));

                                    connection.commit((commitError) => {
                                        if (commitError) return connection.rollback(() => callback(commitError));

                                        connection.release();
                                        callback(null, "Item unequipped and added back to inventory.");
                                    });
                                });
                            }
                        });
                    });
                });
            });
        });
    });
};



// Function to get user's equipment
module.exports.getUserEquipment = (user_id, callback) => {
    const SQLSTATEMENT = `
        SELECT e.equipment_id, e.item_id, i.name, i.type, i.stat_type, i.stat_bonus
        FROM Equipment e
        JOIN Items i ON e.item_id = i.item_id
        WHERE e.user_id = ? AND e.equipped = true;
    `;
    pool.query(SQLSTATEMENT, [user_id], callback);
};
