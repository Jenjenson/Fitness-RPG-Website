//////////////////////////////////////////////////////
// REQUIRE MODULES
//////////////////////////////////////////////////////
const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes')
const challengeRoutes = require('./challengeRoutes');
const itemRoutes = require('./itemRoutes')
const inventoryRoutes = require('./inventoryRoutes')
const equipmentRoutes = require('./equipmentRoutes')
const monsterRoutes = require('./monsterRoutes')
const userController = require('../controllers/userController')
const jwtMiddleware = require('../middlewares/jwtMiddleware')
const bcryptMiddleware = require('../middlewares/bcryptMiddleware')
const allianceRoutes = require('./allianceRoutes')
const questRoutes = require('./questRoutes')
const craftingRoutes = require('./craftingRoutes')
const tradingRoutes = require('./tradingRoutes')

//////////////////////////////////////////////////////
// CREATE ROUTER
//////////////////////////////////////////////////////
router.use("/user", userRoutes);
router.use("/challenges", challengeRoutes);
router.use("/items", itemRoutes)
router.use("/inventory", inventoryRoutes)
router.use("/equipment", equipmentRoutes)
router.use("/monster", monsterRoutes);
router.use("/alliances", allianceRoutes)
router.use("/quests", questRoutes)
router.use("/crafting", craftingRoutes)
router.use("/trade", tradingRoutes)

//////////////////////////////////////////////////////
// DEFINE ROUTES
//////////////////////////////////////////////////////
router.post("/login", userController.login, bcryptMiddleware.comparePassword, jwtMiddleware.generateToken, jwtMiddleware.sendToken);
router.post("/register", userController.checkUsernameOrEmailExist, bcryptMiddleware.hashPassword, userController.register, jwtMiddleware.generateToken, jwtMiddleware.sendToken);

//////////////////////////////////////////////////////
// EXPORT ROUTER
//////////////////////////////////////////////////////
module.exports = router;