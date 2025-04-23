const pool = require('../services/db');

// Get all crafting recipes
module.exports.getAllRecipes = (callback) => {
    const SQLSTATEMENT = `
        SELECT 
            cr.recipe_id,
            ci.item_id AS crafted_item_id,
            ci.name AS crafted_item_name,
            ii.item_id AS ingredient_item_id,
            ii.name AS ingredient_name,
            cr.quantity_required
        FROM 
            CraftingRecipes cr
        JOIN 
            Items ci ON cr.crafted_item_id = ci.item_id
        JOIN 
            Items ii ON cr.ingredient_item_id = ii.item_id;
    `;
    pool.query(SQLSTATEMENT, callback);
};

// Get a crafting recipe by ID
module.exports.getRecipeById = (recipe_id, callback) => {
    const SQLSTATEMENT = `
        SELECT *
        FROM CraftingRecipes
        WHERE recipe_id = ?;
    `;
    pool.query(SQLSTATEMENT, [recipe_id], callback);
};

// Function to check if the user has enough materials
module.exports.checkMaterials = (user_id, material_id, callback) => {
    const SQLSTATEMENT = `
        SELECT quantity
        FROM Inventory
        WHERE user_id = ? AND item_id = ?;
    `;
    pool.query(SQLSTATEMENT, [user_id, material_id], callback);
};

// Function to deduct materials from the user's inventory
module.exports.deductMaterials = (user_id, material_id, quantity, callback) => {
    const SQLSTATEMENT = `
        UPDATE Inventory
        SET quantity = quantity - ?
        WHERE user_id = ? AND item_id = ?;
    `;
    pool.query(SQLSTATEMENT, [quantity, user_id, material_id], callback);
};

// Function to add the crafted item to the user's inventory
module.exports.addCraftedItem = (user_id, crafted_item_id, quantity, callback) => {
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

    // Check if the crafted item exists in the inventory
    pool.query(checkItemQuery, [user_id, crafted_item_id], (error, results) => {
        if (error) {
            return callback(error, null);
        }

        if (results.length > 0) {
            // Item exists, update the quantity
            pool.query(updateItemQuery, [quantity, user_id, crafted_item_id], (updateError) => {
                if (updateError) {
                    return callback(updateError, null);
                }

                callback(null, { message: "Crafted item quantity updated successfully." });
            });
        } else {
            // Item does not exist, insert new crafted item
            pool.query(insertItemQuery, [user_id, crafted_item_id, quantity], (insertError) => {
                if (insertError) {
                    return callback(insertError, null);
                }

                callback(null, { message: "Crafted item added to inventory successfully." });
            });
        }
    });
};

// Function to get Item Name By Id
module.exports.getItemName = (item_id, callback) => {
    const SQLSTATEMENT = `
        SELECT name
        FROM Items
        WHERE item_id = ?;
    `;
    pool.query(SQLSTATEMENT, [item_id], callback);
};

// Get ingredients of a crafting recipe
module.exports.getRecipeIngredients = (recipe_id, callback) => {
    const SQL = `
        SELECT 
            cr.recipe_id,
            cr.crafted_item_id,
            ci.name AS crafted_item_name,
            ii.item_id AS ingredient_item_id,
            ii.name AS ingredient_name,
            cr.quantity_required
        FROM CraftingRecipes cr
        JOIN Items ci ON cr.crafted_item_id = ci.item_id
        JOIN Items ii ON cr.ingredient_item_id = ii.item_id
        WHERE cr.recipe_id = ?;
    `;
    pool.query(SQL, [recipe_id], callback);
};
