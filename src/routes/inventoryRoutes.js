const express = require("express");
const router = express.Router();
const controller = require("../controllers/inventoryController");
const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.get("/", jwtMiddleware.verifyToken, controller.getUserInventory)

router.get("/count", controller.getTotalInventory)

router.get("/:user_id", controller.getUserInventoryById)

module.exports = router;
