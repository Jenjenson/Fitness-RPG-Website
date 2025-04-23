const express = require('express');
const router = express.Router();
const controller = require('../controllers/challengeController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.post('/', jwtMiddleware.verifyToken, controller.createChallenge);

router.delete('/:challenge_id', jwtMiddleware.verifyToken, controller.verifyCreator, controller.deleteChallengeById)

router.post('/:challenge_id', jwtMiddleware.verifyToken, controller.acceptChallenge)

router.put('/:challenge_id', jwtMiddleware.verifyToken, controller.completeChallenge)

router.put('/:challenge_id/edit', jwtMiddleware.verifyToken, controller.verifyCreator, controller.updateChallengeById)

router.put('/:challenge_id/review', jwtMiddleware.verifyToken, controller.editNotesAndRating)

router.get('/completed', controller.getAllCompletedChallenges)

router.get('/categorised', jwtMiddleware.verifyToken, controller.getAllCategorisedChallenges)

router.get('/:challenge_id', controller.getChallengeByChallengeId)

router.get('/:challenge_id/reviews', controller.getChallengeCompletions);

router.get('/:challenge_id/completions', controller.getCompletionsByChallengeId)

module.exports = router;