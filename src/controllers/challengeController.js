const challengeModel = require('../models/challengeModel');

//////////////////////////////////////////////////////
// CONTROLLER TO CHALLENGE COMPLETIONS
//////////////////////////////////////////////////////
module.exports.getChallengeCompletions = (req, res) => {
    const { challenge_id } = req.params;

    challengeModel.getCompletionsByChallengeId(challenge_id, (error, results) => {
        if (error) return res.status(500).json(error);
        if (results.length === 0) {
            return res.status(404).json({ error: "No attempts found for this challenge." });
        }
                // Convert the `completed` field from 0/1 to false/true
                const formattedResults = results.map(result => {
                    return {
                        ...result,
                        completed: result.completed === 1 // Convert 1 to true, 0 to false
                    };
                });

                res.status(200).json(formattedResults);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET SUM OF CHALLENGE COMPLETIONS
//////////////////////////////////////////////////////
module.exports.getAllCompletedChallenges = (req, res) => {
    challengeModel.sumCompletion((error, results) => {
        if (error) {
            return res.status(500).json(error);
        }

        res.status(200).json(results[0]);
    });
};

//////////////////////////////////////////////////////////////////////////
// CONTROLLER TO CATEGORISE CHALLENGES INTO NOT TAKEN, TAKEN, COMPLETED
//////////////////////////////////////////////////////////////////////////
module.exports.getAllCategorisedChallenges = (req, res) => {
    user_id = res.locals.userId

    challengeModel.categoriseChallenges(user_id, (error, results) => {
        if (error) {
            return res.status(500).json(error);
        }

        res.status(200).json(results);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO ACCEPT CHALLENGE
//////////////////////////////////////////////////////
module.exports.acceptChallenge = (req, res) => {
    const { challenge_id } = req.params;
    const user_id  = res.locals.userId;

    if (!user_id) {
        return res.status(400).json({ error: "User ID is required to accept the challenge." });
    }

    const data = { challenge_id, user_id };

    challengeModel.acceptChallenge(data, (acceptError, acceptResults) => {
        if (acceptError) {
            return res.status(500).json({ error: "Failed to accept challenge.", details: acceptError });
        }

        res.status(200).json({
            message: "Challenge accepted successfully.",
            challenge_id,
            user_id,
        });
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO COMPLETE CHALLENGE
//////////////////////////////////////////////////////
module.exports.completeChallenge = (req, res) => {
    const { challenge_id } = req.params;
    const user_id  = res.locals.userId;

    if (!user_id) {
        return res.status(400).json({ error: "User ID is required to complete the challenge." });
    }

    const data = { challenge_id, user_id };

    challengeModel.completeChallenge(data, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Failed to complete challenge.", details: error });
        }

        res.status(200).json({
            message: "Challenge completed successfully.",
            challenge_id,
            user_id,
        });
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO EDIT NOTES AND RATING FOR CHALLENGE
//////////////////////////////////////////////////////
module.exports.editNotesAndRating = (req, res) => {
    const { challenge_id } = req.params;  // Extract challenge_id from route params
    const user_id = res.locals.userId;    // Get user_id from the response locals (assuming user is authenticated)

    if (!user_id) {
        return res.status(400).json({ error: "User ID is required to edit the challenge." });
    }

    // Destructure rating and notes from the request body
    const { rating, notes } = req.body;

    // Validate that rating and notes are provided
    if (rating == null || notes == null) {
        return res.status(400).json({ error: "Both rating and notes are required." });
    }

    // Prepare the data for the database query
    const data = { rating, notes, challenge_id, user_id };

    // Call the model function to edit the rating and notes
    challengeModel.updateReview(data, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Failed to edit.", details: error });
        }

        // Check if any row was affected, if not, it might be an issue with the data (e.g., no review to update)
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "No matching review found for this challenge and user." });
        }

        res.status(200).json({
            message: "Review edited successfully.",
            challenge_id,
            user_id,
        });
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET NUMBER OF COMPLETIONS OF CHALLENGE
//////////////////////////////////////////////////////
module.exports.getCompletionsByChallengeId = (req, res) => {
    challenge_id = req.params.challenge_id

    data = {challenge_id: challenge_id}

    challengeModel.completionsByChallengeId(data, (error, results) => {
        if (error) {
            return res.status(500).json(error);
        }

        res.status(200).json(results[0]);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET CHALLENGE BY ID
//////////////////////////////////////////////////////
module.exports.getChallengeByChallengeId = (req, res) => {
    challenge_id = req.params.challenge_id

    challengeModel.getChallengeById(challenge_id, (error, results) => {
        if (error) {
            return res.status(500).json(error);
        }

        res.status(200).json(results[0]);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO CREATE CHALLENGE
//////////////////////////////////////////////////////
module.exports.createChallenge = (req, res) => {
    const { challenge, skillpoints } = req.body;
    const user_id = res.locals.userId

    if (!challenge || !user_id || skillpoints === undefined) {
        return res.status(400).json({ error: "Challenge, user_id, and skillpoints are required." });
    }

    const data = { challenge, creator_id: user_id, skillpoints };

    challengeModel.insertChallenge(data, (error, results) => {
        if (error) {
            return res.status(500).json(error);
        }

        res.status(201).json({
            challenge_id: results.insertId,
            challenge,
            creator_id: user_id,
            skillpoints,
        });
    });
};

//////////////////////////////////////////////////////
// MIDDLEWARE TO VERIFY CHALLENGE CREATOR
//////////////////////////////////////////////////////
module.exports.verifyCreator = (req, res, next) => {
    const { challenge_id } = req.params;
    const user_id = res.locals.userId
    
    challengeModel.getChallengeById(challenge_id, (error, challengeData) => {
        if (error) return res.status(500).json(error);
        if (!challengeData) return res.status(404).json({ error: "Challenge not found." });

        if (challengeData[0].creator_id != user_id) {
            return res.status(403).json({ error: "Forbidden: You are not the creator of this challenge." });
        }
        next()
    })
}

//////////////////////////////////////////////////////
// CONTROLLER TO UPDATE CHALLENGE
//////////////////////////////////////////////////////
module.exports.updateChallengeById = (req, res) => {
    const { challenge_id } = req.params;
    const { challenge, skillpoints } = req.body;
    const user_id = res.locals.userId

    if (!challenge || skillpoints === undefined || !user_id) {
        return res.status(400).json({ error: "Challenge, skillpoints, and user_id are required." });
    }

    const data = { challenge_id, challenge, skillpoints };

    challengeModel.updateChallenge(data, (error, results) => {
        if (error) return res.status(500).json(error);
        res.status(200).json({ challenge_id, challenge, creator_id: user_id, skillpoints });
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO DELETE CHALLENGE
//////////////////////////////////////////////////////
module.exports.deleteChallengeById = (req, res) => {
    const { challenge_id } = req.params;

    // First, delete the challenge by its ID
    challengeModel.deleteChallengeById(challenge_id, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message || "Failed to delete challenge." });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Challenge not found." });
        }

        // If the challenge was successfully deleted, proceed to delete associated user completions
        challengeModel.deleteUserCompletionById(challenge_id, (completionError, completionResults) => {
            if (completionError) {
                return res.status(500).json({ error: completionError.message || "Failed to delete user completions." });
            }

            // Return a success response (204 No Content)
            return res.status(204).send();
        });
    });
}