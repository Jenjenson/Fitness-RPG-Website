const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.get('/', controller.getAllUsers);

router.get('/me', jwtMiddleware.verifyToken, controller.retrieveUserId)

router.get('/count', controller.getTotalUsers)

router.get('/top5', controller.getTop5)

router.get('/profile', jwtMiddleware.verifyToken, controller.getUserProfile)

router.get('/profile/:user_id', controller.getUserById)

router.get('/challenges', jwtMiddleware.verifyToken, controller.getUserChallenges)

router.put('/username', jwtMiddleware.verifyToken, controller.duplicateUsername, controller.updateUserById)

router.put('/level', jwtMiddleware.verifyToken, controller.levelUp);

router.get('/challenges/completions', jwtMiddleware.verifyToken, controller.getUserChallengesCompletions)

router.get('/quests/completions', jwtMiddleware.verifyToken, controller.getUserQuestCompletions)

module.exports = router;