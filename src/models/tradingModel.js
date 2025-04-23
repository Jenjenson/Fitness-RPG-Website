const pool = require('../services/db');

// Creates a new trade record in the Trades table with 'pending' status by default.
module.exports.createTrade = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO Trades (sender_id, recipient_id, offer_item_id, offer_quantity, request_item_id, request_quantity, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending');
    `;
    pool.query(SQLSTATEMENT, [
        data.sender_id,
        data.recipient_id,
        data.offer_item_id,
        data.offer_quantity,
        data.request_item_id,
        data.request_quantity
    ], callback);
};

// Retrieves a specific trade record by its trade ID.
module.exports.getTradeById = (trade_id, callback) => {
    const SQLSTATEMENT = `SELECT * FROM Trades WHERE trade_id = ?;`;
    pool.query(SQLSTATEMENT, [trade_id], callback);
};

// Retrieves all trades associated with a given user, including offered and requested items.
module.exports.getTradesByUser = (user_id, callback) => {
    const SQLSTATEMENT = `
        SELECT 
            Trades.trade_id,
            Trades.sender_id,
            Trades.recipient_id,
            Trades.offer_quantity,
            Trades.request_quantity,
            Trades.status,
            OfferItem.name AS offer_item_name,
            RequestItem.name AS request_item_name
        FROM Trades
        JOIN Items AS OfferItem ON Trades.offer_item_id = OfferItem.item_id
        JOIN Items AS RequestItem ON Trades.request_item_id = RequestItem.item_id
        WHERE Trades.sender_id = ? OR Trades.recipient_id = ?;
    `;
    pool.query(SQLSTATEMENT, [user_id, user_id], callback);
};

// Updates the status of a trade (e.g., 'accepted', 'declined', 'completed').
module.exports.updateTradeStatus = (trade_id, status, callback) => {
    const SQLSTATEMENT = `
        UPDATE Trades
        SET status = ?
        WHERE trade_id = ?;
    `;
    pool.query(SQLSTATEMENT, [status, trade_id], callback);
};

// Deletes a trade record from the database by its trade ID.
module.exports.deleteTrade = (trade_id, callback) => {
    const SQLSTATEMENT = `DELETE FROM Trades WHERE trade_id = ?;`;
    pool.query(SQLSTATEMENT, [trade_id], callback);
};

// Checks if a user has the required quantity of a specific item in their inventory.
module.exports.checkItemQuantity = (user_id, item_id, required_quantity, callback) => {
    const query = `
        SELECT quantity
        FROM Inventory 
        WHERE user_id = ? AND item_id = ?
    `;
    pool.query(query, [user_id, item_id], callback);
};

// Updates the inventory of a user by modifying the quantity of a specific item.
module.exports.updateInventory = (user_id, item_id, quantity, callback) => {
    const updateQuery = `
        UPDATE Inventory
        SET quantity = quantity + ?
        WHERE user_id = ? AND item_id = ?
    `;
    pool.query(updateQuery, [quantity, user_id, item_id], callback);
};

// Adds a new item to a user's inventory if it does not already exist.
module.exports.addItemToInventory = ({ user_id, item_id, quantity }, callback) => {
    const insertItemQuery = `
        INSERT INTO Inventory (user_id, item_id, quantity) 
        VALUES (?, ?, ?)
    `;
    pool.query(insertItemQuery, [user_id, item_id, quantity], callback);
};
