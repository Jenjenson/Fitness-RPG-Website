const express = require("express");
const router = express.Router();
const controller = require("../controllers/equipmentController");
const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.put("/", jwtMiddleware.verifyToken, controller.unequipEquipmentIfExists, controller.equipItem);

router.get("/", jwtMiddleware.verifyToken, controller.getUserEquipment)

router.put("/unequip", controller.unequipItem)

module.exports = router;
