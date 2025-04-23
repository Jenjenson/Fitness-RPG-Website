const pool = require('../services/db');

// Add item to inventory
module.exports.addItemToInventory = ({ user_id, item_id, quantity }, callback) => {
    const checkItemQuery = `
        SELECT quantity 
        FROM Inventory 
        WHERE user_id = ? AND item_id = ?
    `;

    const updateItemQuery = `
        UPDATE Inventory 
        SET quantity = quantity + ? 
        WHERE user_id = ? AND item_id = ?
    `;

    const insertItemQuery = `
        INSERT INTO Inventory (user_id, item_id, quantity) 
        VALUES (?, ?, ?)
    `;

    // Check if the item exists in the inventory
    pool.query(checkItemQuery, [user_id, item_id], (error, results) => {
        if (error) {
            return callback(error, null);
        }

        if (results.length > 0) {
            // Item exists, update the quantity
            pool.query(updateItemQuery, [quantity, user_id, item_id], (updateError) => {
                if (updateError) {
                    return callback(updateError, null);
                }

                callback(null, { message: "Inventory updated successfully." });
            });
        } else {
            // Item does not exist, insert new item
            pool.query(insertItemQuery, [user_id, item_id, quantity], (insertError) => {
                if (insertError) {
                    return callback(insertError, null);
                }

                callback(null, { message: "Item added to inventory successfully." });
            });
        }
    });
};
// Get user inventory
module.exports.getUserInventory = (user_id, callback) => {
    const SQLSTATEMENT = `
        SELECT 
            i.inventory_id, 
            i.user_id, 
            i.item_id, 
            i.quantity, 
            it.name, 
            it.type, 
            it.stat_bonus, 
            it.stat_type, 
            it.description
        FROM Inventory i
        JOIN Items it ON i.item_id = it.item_id
        WHERE i.user_id = ? AND i.quantity > 0
        ORDER BY i.item_id;
    `;
    pool.query(SQLSTATEMENT, [user_id], callback);
};


// Remove item from inventory
module.exports.removeInventoryItem = (inventory_id, callback) => {
    const SQLSTATEMENT = `DELETE FROM Inventory WHERE inventory_id = ?;`;
    pool.query(SQLSTATEMENT, [inventory_id], callback);
};

// Function to get total items collected by users
module.exports.getSumInventory = (callback) => {
    const SQLSTATEMENT = `
        SELECT SUM(quantity) AS collectedItems
        FROM Inventory;
    `;
    pool.query(SQLSTATEMENT, callback);
};
