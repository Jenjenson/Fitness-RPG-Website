const express = require("express");
const router = express.Router();
const controller = require("../controllers/monsterController");
const jwtMiddleware = require('../middlewares/jwtMiddleware')

// Routes for monster-related actions
router.get('/', controller.getAllMonsterInfo)
router.post('/:monster_id', jwtMiddleware.verifyToken, controller.fightMonster);  // Fight a monster

module.exports = router;
