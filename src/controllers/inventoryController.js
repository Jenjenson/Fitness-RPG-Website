const model = require("../models/inventoryModel.js");

//////////////////////////////////////////////////////
// CONTROLLER TO GET USER'S INVENTORY
//////////////////////////////////////////////////////
module.exports.getUserInventory = (req, res) => {
    const user_id = res.locals.userId;

    if (!user_id) {
        return res.status(400).json({ error: "User ID is required." });
    }

    model.getUserInventory(user_id, (error, results) => {
        if (error) {
            console.error("Error retrieving user inventory:", error);
            return res.status(500).json(error);
        }

        res.status(200).json(results);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET USER INVENTORY BY ID
//////////////////////////////////////////////////////
module.exports.getUserInventoryById = (req, res) => {
    const user_id = req.params.user_id ;

    if (!user_id) {
        return res.status(400).json({ error: "User ID is required." });
    }

    model.getUserInventory(user_id, (error, results) => {
        if (error) {
            console.error("Error retrieving user inventory:", error);
            return res.status(500).json(error);
        }

        res.status(200).json(results);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET SUM OF ITEMS COLLECTED
//////////////////////////////////////////////////////
module.exports.getTotalInventory = (req, res) => {
    model.getSumInventory((error, results) => {
        if (error) {
            return res.status(500).json(error);
        }

        res.status(200).json(results[0]);
    });
};