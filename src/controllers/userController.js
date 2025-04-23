const model = require("../models/userModel.js");

//////////////////////////////////////////////////////
// CONTROLLER TO GET ALL USERS
//////////////////////////////////////////////////////
module.exports.getAllUsers = (req, res) => {
    model.getAllUsers((error, results) => {
        if (error) {
            console.error("Error retrieving users:", error);
            return res.status(500).json(error);
        }

        res.status(200).json(results);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO LEVEL UP
//////////////////////////////////////////////////////
module.exports.levelUp = (req, res, next) => {
    const user_id = res.locals.userId;

    if (!user_id) {
        return res.status(400).json({ error: "user_id is required" });
    }

    const callback = (error, result) => {
        if (error) {
            console.error("Level up error:", error); // Log error for debugging
            return res.status(500).json({ error: "An error occurred while leveling up.", details: error });
        }

        if (result.affectedRows === 0) {
            return res.status(400).json({
                error: "Insufficient skillpoints to level up."
            });
        }

        // Assuming the new level is returned from the database operation
        return res.status(200).json({
            message: "Level up successful!",
        });
    };

    model.increaseLevel(user_id, callback);
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET USER BY ID
//////////////////////////////////////////////////////
module.exports.getUserById = (req, res) => {
    const user_id = req.params.user_id;


    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    model.findUserById(user_id, (error, result) => {
        if (error) {
            console.error("Error getting user info:", error);
            return res.status(500).json({ error: 'Error getting user information.', details: error });
        }

        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json(result[0]);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET USER'S PROFILE
//////////////////////////////////////////////////////
module.exports.getUserProfile = (req, res) => {
    const user_id = res.locals.userId;


    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    model.findUserById(user_id, (error, result) => {
        if (error) {
            console.error("Error getting user info:", error);
            return res.status(500).json({ error: 'Error getting user information.', details: error });
        }

        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json(result[0]);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER FOR LOGIN
//////////////////////////////////////////////////////
module.exports.login = (req, res, next) => {
    if(req.body.username == undefined || req.body.password == undefined)
        {
            res.status(400).send("Error: name is undefined");
            return;
        }
        
    
    const data = {
        username: req.body.username
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error createNewUser:", error);
            res.status(500).json(error);
        } else {
            if (results.length == 0) {
                return res.status(404).json({ message: "User not found" })
            }
            res.locals.hash = results[0].password;
            res.locals.userId = results[0].user_id;

            next()
        }
    };

    model.selectUserByUsername(data, callback);
};


//////////////////////////////////////////////////////
// CONTROLLER FOR REGISTER
//////////////////////////////////////////////////////
module.exports.register = (req, res, next) => {
    if(req.body.username == undefined || req.body.email == undefined || req.body.password == undefined)
        {
            res.status(400).send("Error: name is undefined");
            return;
        }
        
    
    const data = {
        username: req.body.username,
        email: req.body.email,
        password: res.locals.hash
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error createNewUser:", error);
            return res.status(500).json(error);
        } else {
            res.locals.userId = results.insertId;
            res.locals.message = `User ${data.username} created successfully.`
            next();
        }
    };

    model.insertSingle(data, callback);
};

//////////////////////////////////////////////////////
// MIDDLEWARE FOR CHECK IF USERNAME OR EMAIL EXISTS
//////////////////////////////////////////////////////
module.exports.checkUsernameOrEmailExist = (req, res, next) => {
    const data = {
        username: req.body.username,
        email: req.body.email,
    };

    model.selectUserByUsernameOrEmail(data, (error, results) => {
        if (error) {
            console.error("Error checking username:", error);
            return res.status(500).json(error);
        }

        if (results.length > 0) {
            return res.status(409).json({ message: "Username or email already exists" });
        }
            next()
    })
    };

//////////////////////////////////////////////////////
// MIDDLWARE FOR CHECK IF PLAYER BELONGS TO USER
//////////////////////////////////////////////////////
module.exports.checkPlayerBelongsToUser = (req, res, next) => {
    const playerId = req.params.playerId || req.body.playerId;
    const userId = res.locals.userId;

    // Validate required parameters
    if (playerId == undefined|| userId == undefined) {
        return res.status(400).json({ error: "Missing playerId or userId" });
    }

    const data = {
        player_id: playerId,
        user_id: userId
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error in checkPlayerBelongsToUser:", error);
            return res.status(500).json({ error: "Internal server error" });
        }

        if (!results || results.length === 0) {
            return res.status(404).json({ message: "Player not owned by user" });
        }

        // Proceed to the next middleware or route handler
        next();
    };

    model.findAssociation(data, callback);
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET TOP 5 LEVEL USERS
//////////////////////////////////////////////////////
module.exports.getTop5 = (req, res) => {
    model.selectTop5Users((error, results) => {
        if (error) {
            console.error("Error retrieving users:", error);
            return res.status(500).json({ error: "An error occurred while retrieving users." });
        }

        if (!results || results.length === 0) {
            return res.status(404).json({ error: "No users found." });
        }

        res.status(200).json(results);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET TOTAL USERS
//////////////////////////////////////////////////////
module.exports.getTotalUsers = (req, res) => {
    model.totalUsers((error, results) => {
        if (error) {
            return res.status(500).json(error);
        }
        res.status(200).json(results[0]);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET ALL FITNESS CHALLENGES FOR USER
//////////////////////////////////////////////////////
module.exports.getUserChallenges = (req, res) => {
    const userId = res.locals.userId;


    // Fetching user challenges
    model.getUserCompletionById(userId, (error, results) => {
        if (error) {
            return res.status(500).json({ message: "Error fetching challenges", error });
        }

        // Check if results are empty
        if (results.length === 0) {
            return res.status(404).json({ message: "No challenges found for this user" });
        }


        return res.status(200).json({ challenges: results });
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET ALL FITNESS CHALLENGES COMPLETIONS COUNT FOR USER
//////////////////////////////////////////////////////
module.exports.getUserChallengesCompletions = (req, res) => {
    const userId = res.locals.userId;


    // Fetching user challenges
    model.getUserCountChallengeCompletions(userId, (error, results) => {
        if (error) {
            return res.status(500).json({ message: "Error fetching challenges", error });
        }

        // Check if results are empty
        if (results.length === 0) {
            return res.status(404).json({ message: "No challenges found for this user" });
        }


        return res.status(200).json(results[0]);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET ALL QUEST COMPLETION COUNT FOR USER
//////////////////////////////////////////////////////
module.exports.getUserQuestCompletions = (req, res) => {
    const userId = res.locals.userId;


    // Fetching user challenges
    model.getUserCountQuestsCompletions(userId, (error, results) => {
        if (error) {
            return res.status(500).json({ message: "Error fetching quests", error });
        }

        // Check if results are empty
        if (results.length === 0) {
            return res.status(404).json({ message: "No quests found for this user" });
        }


        return res.status(200).json(results[0]);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO RETRIEVE CURRENT USER ID
//////////////////////////////////////////////////////
module.exports.retrieveUserId = (req, res) => {
    return res.json({ user_id: res.locals.userId })
};

//////////////////////////////////////////////////////
// MIDDLEWARE TO CHECK DUPLICATE USERNAME
//////////////////////////////////////////////////////
module.exports.duplicateUsername = (req, res, next) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Username is required." });
    }

    model.findByUsername(username, (error, results) => {
        if (error) {
            console.error("Error checking username:", error);
            return res.status(500).json(error);
        }

        if (results.length > 0) {
            return res.status(409).json({ error: "Username already exists." });
        }
        next()
    })
}

//////////////////////////////////////////////////////
// CONTROLLER TO UPDATE USERNAME
//////////////////////////////////////////////////////
module.exports.updateUserById = (req, res) => {
    const user_id = res.locals.userId;
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Username is required." });
    }

        model.updateUsernameUserById({ user_id, username }, (error, updateResults) => {
            if (error) {
                console.error("Error updating user:", error);
                return res.status(500).json(error);
            }

            if (updateResults.affectedRows === 0) {
                return res.status(404).json({ error: "User not found." });
            }

            res.status(200).json({
                user_id,
                username
            });
        });
    }