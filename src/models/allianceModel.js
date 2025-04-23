const pool = require("../services/db");

// Create a new alliance
module.exports.createAlliance = (name, description, leader_id, callback) => {
    const query = 'INSERT INTO alliance (name, description, leader_id) VALUES (?, ?, ?)';
    pool.query(query, [name, description, leader_id], callback)
};

// New method to fetch alliance details by ID
module.exports.getAllianceById = (alliance_id, callback) => {
    const query = 'SELECT alliance_id, name, description, leader_id FROM alliance WHERE alliance_id = ?';
    pool.query(query, [alliance_id], callback)
};

module.exports.addLeaderToAlliance = (alliance_id, user_id, callback) => {
    const query = 'INSERT INTO alliancemembers (alliance_id, user_id, role) VALUES (?, ?, ?)';
    pool.query(query, [alliance_id, user_id, 'leader'], callback)
};

// Add a member to an alliance
module.exports.addMemberToAlliance = (alliance_id, user_id, callback) => {
    const query = 'INSERT INTO alliancemembers (alliance_id, user_id) VALUES (?, ?)';
    pool.query(query, [alliance_id, user_id], callback)
};

// Set the leader for an alliance
module.exports.setAllianceLeader = (alliance_id, new_leader_id, callback) => {
    const query = `
        -- Start the transaction
        START TRANSACTION;

        -- Update the role of the previous leader in the AllianceMembers table to 'member'
        UPDATE AllianceMembers 
        SET role = 'member' 
        WHERE alliance_id = ? AND role = 'leader';

        -- Update the leader in the Alliance table
        UPDATE Alliance 
        SET leader_id = ? 
        WHERE alliance_id = ?;

        -- Update the role of the new leader in the AllianceMembers table
        UPDATE AllianceMembers 
        SET role = 'leader' 
        WHERE alliance_id = ? AND user_id = ?;

        -- Commit the transaction
        COMMIT;`;
    pool.query(query, [alliance_id, new_leader_id, alliance_id, alliance_id, new_leader_id], callback)
};

// Remove a member from an alliance
module.exports.removeMemberFromAlliance = (alliance_id, user_id, callback) => {
    const query = 'DELETE FROM alliancemembers WHERE alliance_id = ? AND user_id = ?';
    pool.query(query, [alliance_id, user_id], callback)
};

// Get all alliance
module.exports.getAllAlliances = (callback) => {
    const query = `
        SELECT 
            a.alliance_id, 
            a.name, 
            a.description, 
            a.leader_id, 
            u.username AS leader_name, 
            COUNT(am.user_id) AS total_members
        FROM 
            alliance a
        LEFT JOIN 
            alliancemembers am ON a.alliance_id = am.alliance_id
        LEFT JOIN 
            user u ON a.leader_id = u.user_id
        GROUP BY 
            a.alliance_id
        HAVING 
            total_members > 0
    `;

    pool.query(query, callback);
};



// Get all members of an alliance
module.exports.getAllianceMembers = (alliance_id, callback) => {
    const query = `
        SELECT am.user_id, u.username, am.role, u.level 
        FROM alliancemembers am
        JOIN user u ON am.user_id = u.user_id
        WHERE am.alliance_id = ?`;
    
    pool.query(query, [alliance_id], callback);
};


// Check if the user is already a member of any alliance
module.exports.checkIfMemberExists = (user_id, callback) => {
    const query = 'SELECT * FROM alliancemembers WHERE user_id = ?';
    pool.query(query, [user_id], callback)
};

// Check if user exists in specific alliance
module.exports.checkIfMemberExistsInAlliance = (alliance_id, user_id, callback) => {
    const query = 'SELECT * FROM alliancemembers WHERE alliance_id = ? AND user_id = ?';
    pool.query(query, [alliance_id, user_id], callback)
};

// Get User's Alliance Details
module.exports.getUserAlliance = (userId, callback) => {
    const query = `
        SELECT 
            a.alliance_id, 
            a.name, 
            a.description, 
            a.leader_id, 
            u.username AS leader_name, 
            COUNT(am.user_id) AS total_members,
            CASE
                WHEN a.leader_id = ? THEN 'Leader'
                ELSE 'Member'
            END AS role
        FROM 
            alliance a
        LEFT JOIN 
            alliancemembers am ON a.alliance_id = am.alliance_id
        LEFT JOIN 
            user u ON a.leader_id = u.user_id
        WHERE 
            a.alliance_id IN (
                SELECT alliance_id 
                FROM alliancemembers 
                WHERE user_id = ?
            )
        GROUP BY 
            a.alliance_id;
    `;

    pool.query(query, [userId, userId], callback);
};

// Get Alliance Details by Alliance Id
module.exports.getAllianceDetails = (allianceId, callback) => {
    const query = `
        SELECT 
            a.alliance_id, 
            a.name, 
            a.description, 
            a.leader_id, 
            u.username AS leader_name, 
            COUNT(am.user_id) AS total_members
        FROM 
            alliance a
        LEFT JOIN 
            alliancemembers am ON a.alliance_id = am.alliance_id
        LEFT JOIN 
            user u ON a.leader_id = u.user_id
        WHERE 
            a.alliance_id = ?
        GROUP BY 
            a.alliance_id;
    `;
    
    pool.query(query, [allianceId], callback);
};

