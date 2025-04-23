const express = require("express");
const router = express.Router();
const controller = require("../controllers/questController");
const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.post("/:quest_id", jwtMiddleware.verifyToken, controller.assignQuest)

router.get("/categorised", jwtMiddleware.verifyToken, controller.getCategorisedQuests)

module.exports = router;
