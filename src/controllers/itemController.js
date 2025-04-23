const model = require("../models/itemModel.js");

//////////////////////////////////////////////////////
// CONTROLLER TO CREATE ITEM
//////////////////////////////////////////////////////
module.exports.createItem = (req, res) => {
    const { name, description, type, stat_type, stat_bonus } = req.body;

    // Validation: Ensure all fields are provided
    if (!name || !description || !type || !stat_type || stat_bonus === undefined) {
        return res.status(400).json({
            error: "Name, description, type, stat_type, and stat_bonus are required.",
        });
    }

    // Create the item
    model.createItem(
        { name, description, type, stat_type, stat_bonus },
        (error, result) => {
            if (error) {
                console.error("Error creating item:", error);
                return res.status(500).json({ error: "Failed to create item." });
            }

            res.status(201).json({
                message: "Item created successfully.",
                item_id: result.insertId,
                name,
                description,
                type,
                stat_type,
                stat_bonus,
            });
        }
    );
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET ALL ITEMS
//////////////////////////////////////////////////////
module.exports.getAllItems = (req, res) => {
    model.getAllItems((error, results) => {
        if (error) {
            console.error("Error retrieving items:", error);
            return res.status(500).json({ error: "Failed to retrieve items." });
        }

        res.status(200).json(results);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET ITEM BY ID
//////////////////////////////////////////////////////
module.exports.getItemById = (req, res) => {
    const { item_id } = req.params;

    model.getItemById(item_id, (error, result) => {
        if (error) {
            console.error("Error retrieving item:", error);
            return res.status(500).json({ error: "Failed to retrieve item." });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "Item not found." });
        }

        res.status(200).json(result[0]);
    });
};


//////////////////////////////////////////////////////
// CONTROLLER TO DELETE ITEM
//////////////////////////////////////////////////////
module.exports.deleteItemById = (req, res) => {
    const { item_id } = req.params;

    model.deleteItemById(item_id, (error, result) => {
        if (error) {
            console.error("Error deleting item:", error);
            return res.status(500).json(error);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Item not found." });
        }

        res.status(200).json({ message: "Item deleted successfully." });
    });
};
