const model = require('../models/monsterModel');
const inventoryModel = require("../models/inventoryModel.js");

//////////////////////////////////////////////////////
// CONTROLLER TO GET ALL MONSTER DETAILS
//////////////////////////////////////////////////////
module.exports.getAllMonsterInfo = (req, res) => {
    model.getAllMonsters((error, result) => {
        if (error) {
            return res.status(500).json({ error: 'Error fetching monster data.', details: error });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Monsters not found.' });
        }

        res.status(200).json(result);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO FIGHT A MONSTER
//////////////////////////////////////////////////////
module.exports.fightMonster = (req, res) => {
    const { monster_id } = req.params;
    const { userId: user_id } = res.locals;

    if (!user_id || !monster_id) {
        return res.status(400).json({ error: "user_id and monster_id are required" });
    }

    const calculateDamage = (attackerSTR, defenderDEF) => {
        let damage = attackerSTR - defenderDEF;
        return damage > 0 ? damage : 1;
    };

    const battle = (player, monster, callback) => {
        let playerHP = player.HP;
        let monsterHP = monster.HP;
        let reward = { exp: monster.EXP, itemDropped: null };

        while (playerHP > 0 && monsterHP > 0) {
            const playerDamage = calculateDamage(player.STR, monster.DEF);
            monsterHP -= playerDamage;
            if (monsterHP <= 0) break;

            const monsterDamage = calculateDamage(monster.STR, player.DEF);
            playerHP -= monsterDamage;
        }

        if (playerHP > 0) {
            if (Math.random() < 0.5 && monster.drop_item) {
                reward.itemDropped = monster.drop_item;
                reward.itemDroppedId = monster.drop_item_id;
            }
            callback(null, reward);
        } else {
            callback({ error: "You were defeated by the monster!" });
        }
    };

    model.getUserData(user_id, (userError, userResult) => {
        if (userError) {
            return res.status(500).json({ error: 'Error fetching user data.' });
        }

        model.getMonsterData(monster_id, (monsterError, monsterResult) => {
            if (monsterError) {
                return res.status(500).json({ error: 'Error fetching monster data.' });
            }

            const user = userResult[0];
            const monster = monsterResult[0];

            battle(user, monster, (battleError, battleResult) => {
                if (battleError) {
                    return res.status(400).json(battleError);
                } else {
                    const newXP = user.skillpoints + battleResult.exp;

                    model.updateUserXP(user_id, newXP, (xpError) => {
                        if (xpError) {
                            return res.status(500).json({ error: 'Error updating user XP.' });
                        }

                        if (battleResult.itemDropped) {
                            const item = battleResult.itemDroppedId;

                            inventoryModel.addItemToInventory({ user_id, item_id: item, quantity: 1 }, (inventoryError) => {
                                if (inventoryError) {
                                    return res.status(500).json({ error: 'Error adding item to inventory.' });
                                }

                                // Update quest progress here
                                model.updateQuestProgress(user_id, monster_id, (questError) => {
                                    if (questError) {
                                        return res.status(500).json({ error: 'Error updating quest progress.' });
                                    }

                                    res.status(200).json({
                                        message: 'You defeated the monster!',
                                        reward: battleResult,
                                        newXP: newXP
                                    });
                                });
                            });
                        } else {
                            // No item dropped, just update quest progress
                            model.updateQuestProgress(user_id, monster_id, (questError) => {
                                if (questError) {
                                    return res.status(500).json({ error: 'Error updating quest progress.' });
                                }

                                res.status(200).json({
                                    message: 'You defeated the monster!',
                                    reward: battleResult,
                                    newXP: newXP
                                });
                            });
                        }
                    });
                }
            });
        });
    });
};