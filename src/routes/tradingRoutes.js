const express = require("express");
const router = express.Router();
const controller = require("../controllers/tradingController");
const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.post("/", jwtMiddleware.verifyToken, controller.createTrade);

router.get('/', jwtMiddleware.verifyToken, controller.getUserTrades)

router.get('/:trade_id', controller.getTradeById)

router.put('/:trade_id/status', controller.updateTradeStatus)

module.exports = router;
