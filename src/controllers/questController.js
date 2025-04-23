const questModel = require('../models/questModel');
const userModel = require('../models/userModel')

//////////////////////////////////////////////////////
// CONTROLLER TO ASSIGN QUEST TO USER
//////////////////////////////////////////////////////
module.exports.assignQuest = (req, res) => {
    const { quest_id } = req.params
    const user_id = res.locals.userId;

    questModel.assignQuestToUser(user_id, quest_id, (error, result) => {
        if (error) {
            return res.status(500).json({ error: 'Error assigning quest.', details: error });
        }
        res.status(200).json({ message: 'Quest assigned successfully!' });
    });
};

//////////////////////////////////////////////////////////////////////////
// CONTROLLER TO GET CATEGORISED QUESTS: NOT TAKEN, INCOMPLETE, COMPLETED
//////////////////////////////////////////////////////////////////////////
module.exports.getCategorisedQuests = (req, res) => {
    const user_id = res.locals.userId;

    if (!user_id) {
        return res.status(400).json({ error: "User ID is required." });
    }

    questModel.categoriseQuests(user_id, (error, result) => {
        if (error) {
            return res.status(500).json({ error: 'Error fetching categorised quests.', details: error });
        }

        res.status(200).json(result);
    });
};