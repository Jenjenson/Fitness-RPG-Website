const model = require("../models/equipmentModel.js");

//////////////////////////////////////////////////////
// MIDDLEWARE TO UNEQUIP EXISTING ITEM OF SAME SLOT
//////////////////////////////////////////////////////
module.exports.unequipEquipmentIfExists = (req, res, next) => {
    const user_id = res.locals.userId;
    const { item_type: slot } = req.body;

    model.checkEquippedItemType(user_id, slot, (checkError, equippedResults) => {
        if (checkError) return res.status(500).json({ error: "Internal server error." });

        const existingItem = equippedResults[0];
        if (!existingItem) return next();

        model.unequipItem(existingItem.equipment_id, (unequipError) => {
            if (unequipError) return res.status(500).json({ error: "Failed to unequip existing item." });

            next();
        });
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO EQUIP ITEM
//////////////////////////////////////////////////////
module.exports.equipItem = (req, res) => {
    const user_id = res.locals.userId;
    const { item_id, item_type: slot } = req.body;

    if (!user_id || !item_id || !slot) {
        return res.status(400).json({ error: "Item ID and slot are required." });
    }

    model.equipItemAndUpdateStats(user_id, item_id, slot, (equipError) => {
        if (equipError) return res.status(500).json({ error: "Failed to equip item." });

        res.status(200).json({ message: "Item equipped successfully." });
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET EQUIPPED ITEMS
//////////////////////////////////////////////////////
module.exports.getUserEquipment = (req, res) => {
    const user_id = res.locals.userId;

    model.getUserEquipment(user_id, (error, results) => {
        if (error) return res.status(500).json(error);

        res.status(200).json(results);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO UNEQUIP ITEM
//////////////////////////////////////////////////////
module.exports.unequipItem = (req, res) => {
    const { equipment_id } = req.body;

    model.unequipItem(equipment_id, (unequipError) => {
        if (unequipError) return res.status(500).json({ error: "Failed to unequip item." });

        res.status(200).json({ message: "Item unequipped successfully." });
    });
};
