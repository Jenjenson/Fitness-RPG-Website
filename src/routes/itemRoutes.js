const express = require("express");
const router = express.Router();
const controller = require("../controllers/itemController");

router.post("/", controller.createItem);

router.get("/", controller.getAllItems)

router.get("/:item_id", controller.getItemById)

router.delete('/:item_id', controller.deleteItemById)

module.exports = router;
