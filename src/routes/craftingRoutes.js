const express = require('express');
const router = express.Router();
const controller = require('../controllers/craftingController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.get('/', controller.getAllCraftingRecipes);

router.put('/', jwtMiddleware.verifyToken, controller.craftItem)

module.exports = router;