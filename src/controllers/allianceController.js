const allianceModel = require("../models/allianceModel");

//////////////////////////////////////////////////////
// CONTROLLER TO CREATE ALLIANCE
//////////////////////////////////////////////////////
module.exports.createAlliance = createAlliance = (req, res) => {
    const { name, description } = req.body;
    const leader_id = res.locals.userId

    allianceModel.createAlliance(name, description, leader_id, (error, result) => {
        if (error) {
            // Check if the error is due to a duplicate alliance name
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Alliance name must be unique.' });
            }
            return res.status(500).json({ message: error.message });
        }

        const alliance_id = result.insertId;

        allianceModel.addLeaderToAlliance(alliance_id, leader_id, (addError) => {
            if (addError) {
                return res.status(500).json({ message: "Error adding leader to the alliance", error: addError });
            }

            allianceModel.getAllianceById(alliance_id, (fetchError, alliance) => {
                if (fetchError) {
                    return res.status(500).json({ message: "Error fetching alliance details", error: fetchError });
                }

                return res.status(200).json({
                    message: "Alliance created successfully",
                    alliance,
                });
            });
        });
    });
};


//////////////////////////////////////////////////////
// CONTROLLER TO ADD USER TO ALLIANCE
//////////////////////////////////////////////////////
module.exports.addMemberToAlliance = (req, res, next) => {
    const { alliance_id } = req.params;
    const user_id = res.locals.userId;

    allianceModel.addMemberToAlliance(alliance_id, user_id, (error, result) => {
        if (error) {
            return res.status(400).json({ error: error.message || "Failed to add member to alliance" });
        }
        return res.status(200).json({
            message: "Member added successfully",
            alliance_id,
            user_id,
        });
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO CHECK IF USER IS IN ALLIANCE
//////////////////////////////////////////////////////
module.exports.checkLeaderMembership = (req, res, next) => {
    const { alliance_id } = req.params;
    const { user_id } = req.body;

    if (!user_id || !alliance_id) {
        return res.status(400).json({ message: 'New leader ID (user_id) and alliance ID are required' });
    }
    allianceModel.checkIfMemberExistsInAlliance(alliance_id, user_id, (err, isMember) => {
        if (err) {
            return res.status(500).json({ message: 'Error checking user membership' });
        }

        if (!isMember) {
            return res.status(400).json({ message: 'User is not a member of the alliance' });
        }
        next()
    })
}

//////////////////////////////////////////////////////
// CONTROLLER TO SET USER AS ALLIANCE LEADER
//////////////////////////////////////////////////////
module.exports.setAllianceLeader = (req, res) => {
    const { alliance_id } = req.params;
    const { user_id } = req.body;

    allianceModel.setAllianceLeader(alliance_id, user_id, (error, result) => {
        if (error) {
            return res.status(500).json({ message: 'Error updating leader' });
        }
        
        return res.status(200).json({
            message: 'Alliance leader updated successfully',
            alliance_id,
            new_leader_id: user_id,
        });
    });
};


//////////////////////////////////////////////////////
// CONTROLLER TO REMOVE USER FROM ALLIANCE
//////////////////////////////////////////////////////
module.exports.removeMemberFromAlliance = (req, res) => {
    const { alliance_id} = req.params;
    const  user_id = res.locals.userId

    if (!alliance_id || !user_id) {
        return res.status(400).json({ error: "Missing alliance_id or user_id in request parameters" });
    }

        // Proceed to remove the member if they are part of the alliance
        allianceModel.removeMemberFromAlliance(alliance_id, user_id, (error, result) => {
            if (error) {
                return res.status(400).json({ error: error.message || "Failed to remove member from alliance" });
            }

            return res.status(200).json({
                message: "Member removed successfully",
                alliance_id,
                user_id,
            });
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET ALL ALLIANCES
//////////////////////////////////////////////////////
module.exports.getAllAlliances = (req, res) => {
    
    allianceModel.getAllAlliances((error, result) => {
        if (error) {
            return res.status(400).json({ error: error.message || "Failed to retrieve alliances" });
        }

        return res.status(200).json(result);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET ALL MEMBERS OF AN ALLIANCE
//////////////////////////////////////////////////////
module.exports.getAllianceMembers = (req, res) => {
    const { alliance_id } = req.params;

    if (!alliance_id) {
        return res.status(400).json({ error: "Missing alliance_id in request parameters" });
    }

    allianceModel.getAllianceMembers(alliance_id, (error, result) => {
        if (error) {
            return res.status(400).json({ error: error.message || "Failed to retrieve alliance members" });
        }

        return res.status(200).json(result);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET LOGGED IN USER'S ALLIANCE
//////////////////////////////////////////////////////
module.exports.getUserAllianceInfo = (req, res) => {
    const { userId } = res.locals;

    allianceModel.getUserAlliance(userId, (error, result) => {
        if (error) {
            return res.status(400).json({ error: error.message || "Failed to retrieve alliance info" });
        }

        return res.status(200).json(result[0]);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET IN USER'S ALLIANCE BY ID
//////////////////////////////////////////////////////
module.exports.getAllianceInfo = (req, res) => {
    const { alliance_id } = req.params;

    allianceModel.getAllianceDetails(alliance_id, (error, result) => {
        if (error) {
            return res.status(400).json({ error: error.message || "Failed to retrieve alliance info" });
        }

        return res.status(200).json(result[0]);
    });
};