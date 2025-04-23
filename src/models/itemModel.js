const pool = require('../services/db');

// 1. Create an item with type, stat bonuses, and stat type
module.exports.createItem = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO Items (name, description, type, stat_type, stat_bonus)
        VALUES (?, ?, ?, ?, ?);
    `;
    pool.query(
        SQLSTATEMENT,
        [data.name, data.description, data.type, data.stat_type, data.stat_bonus],
        callback
    );
};

// 2. Retrieve all items (with type and stat details)
module.exports.getAllItems = (callback) => {
    const SQLSTATEMENT = `
        SELECT item_id, name, description, type, stat_type, stat_bonus
        FROM Items;
    `;
    pool.query(SQLSTATEMENT, callback);
};

// 3. Get a specific item by ID (with type and stat details)
module.exports.getItemById = (item_id, callback) => {
    const SQLSTATEMENT = `
        SELECT item_id, name, description, type, stat_type, stat_bonus
        FROM Items
        WHERE item_id = ?;
    `;
    pool.query(SQLSTATEMENT, [item_id], callback);
};


// Delete an item by ID
module.exports.deleteItemById = (item_id, callback) => {
    const SQLSTATEMENT = `DELETE FROM Items WHERE item_id = ?;`;
    pool.query(SQLSTATEMENT, [item_id], callback);
};
