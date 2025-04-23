const express = require("express");
const router = express.Router();
const controller = require("../controllers/allianceController");
const jwtMiddleware = require('../middlewares/jwtMiddleware');

// Get all alliances
router.get("/", controller.getAllAlliances);

router.get('/user', jwtMiddleware.verifyToken, controller.getUserAllianceInfo)

router.get('/:alliance_id', controller.getAllianceInfo)

// Get all members of an alliance
router.get("/:alliance_id/members", controller.getAllianceMembers);

router.post('/join/:alliance_id', jwtMiddleware.verifyToken, controller.addMemberToAlliance)

router.delete('/leave/:alliance_id', jwtMiddleware.verifyToken, controller.removeMemberFromAlliance)

router.post("/", jwtMiddleware.verifyToken, controller.createAlliance);

router.put("/:alliance_id/leader", controller.checkLeaderMembership, controller.setAllianceLeader);

module.exports = router;
