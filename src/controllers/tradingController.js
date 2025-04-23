const model = require('../models/tradingModel.js');

//////////////////////////////////////////////////////
// CONTROLLER TO CREATE A TRADE
//////////////////////////////////////////////////////
module.exports.createTrade = (req, res) => {
    const { recipient_id, offer_item_id, offer_quantity, request_item_id, request_quantity } = req.body;
    const sender_id = res.locals.userId;

    if (!recipient_id || !offer_item_id || !offer_quantity || !request_item_id || !request_quantity) {
        return res.status(400).json({ error: "All trade details are required." });
    }

    model.createTrade(
        { sender_id, recipient_id, offer_item_id, offer_quantity, request_item_id, request_quantity },
        (error, results) => {
            if (error) {
                console.error("Error creating trade:", error);
                return res.status(500).json(error);
            }

            res.status(200).json({
                message: "Trade request created successfully.",
                trade_id: results.insertId
            });
        }
    );
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET TRADE BY ID
//////////////////////////////////////////////////////
module.exports.getTradeById = (req, res) => {
    const { trade_id } = req.params;

    model.getTradeById(trade_id, (error, results) => {
        if (error) {
            console.error("Error retrieving trade:", error);
            return res.status(500).json(error);
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Trade not found." });
        }

        res.status(200).json(results[0]);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO GET USER'S TRADES
//////////////////////////////////////////////////////
module.exports.getUserTrades = (req, res) => {
    const user_id = res.locals.userId;

    model.getTradesByUser(user_id, (error, results) => {
        if (error) {
            console.error("Error retrieving user trades:", error);
            return res.status(500).json(error);
        }

        res.status(200).json(results);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO UPDATE TRADE STATUS (ACCEPTED OR DECLINED)
//////////////////////////////////////////////////////
module.exports.updateTradeStatus = (req, res) => {
    const { trade_id } = req.params;
    const { status } = req.body;

    if (!['accepted', 'declined'].includes(status)) {
        return res.status(400).json({ error: "Invalid trade status." });
    }

    // Fetch trade details first
    model.getTradeById(trade_id, (error, tradeDetails) => {
        if (error) {
            console.error("Error fetching trade details:", error);
            return res.status(500).json(error);
        }

        if (!tradeDetails || tradeDetails.length === 0) {
            return res.status(404).json({ error: "Trade not found." });
        }

        const trade = tradeDetails[0];

        if (status === 'accepted') {
            // Check if sender has enough quantity of the offered item
            model.checkItemQuantity(trade.sender_id, trade.offer_item_id, trade.offer_quantity, (err, senderItemData) => {
                if (err) {
                    console.error("Error checking sender's item quantity:", err);
                    return res.status(500).json(err);
                }

                if (!senderItemData || senderItemData.length === 0 || senderItemData[0].quantity < trade.offer_quantity) {
                    return res.status(400).json({ error: "Sender lacks the required quantity of the offered item." });
                }

                // Check if recipient has enough quantity of the requested item
                model.checkItemQuantity(trade.recipient_id, trade.request_item_id, trade.request_quantity, (err, recipientItemData) => {
                    if (err) {
                        console.error("Error checking recipient's item quantity:", err);
                        return res.status(500).json(err);
                    }

                    if (!recipientItemData || recipientItemData.length === 0 || recipientItemData[0].quantity < trade.request_quantity) {
                        return res.status(400).json({ error: "Recipient lacks the required quantity of the requested item." });
                    }

                    // Check if sender already has the requested item
                    model.checkItemQuantity(trade.sender_id, trade.request_item_id, 1, (err, senderRequestItem) => {
                        if (err) {
                            console.error("Error checking sender's requested item:", err);
                            return res.status(500).json(err);
                        }

                        // If sender does not have the requested item, add a new row
                        if (!senderRequestItem || senderRequestItem.length === 0) {
                            model.addItemToInventory({
                                user_id: trade.sender_id,
                                item_id: trade.request_item_id,
                                quantity: 0 // Start with 0 so the next step increments properly
                            }, (err) => {
                                if (err) {
                                    console.error("Error adding requested item to sender's inventory:", err);
                                    return res.status(500).json(err);
                                }
                            });
                        }

                        // Check if recipient already has the offer item
                        model.checkItemQuantity(trade.recipient_id, trade.offer_item_id, 1, (err, recipientOfferItem) => {
                            if (err) {
                                console.error("Error checking recipient's offer item:", err);
                                return res.status(500).json(err);
                            }

                            // If recipient does not have the offer item, add a new row
                            if (!recipientOfferItem || recipientOfferItem.length === 0) {
                                model.addItemToInventory({
                                    user_id: trade.recipient_id,
                                    item_id: trade.offer_item_id,
                                    quantity: 0 // Start with 0 so the next step increments properly
                                }, (err) => {
                                    if (err) {
                                        console.error("Error adding offer item to recipient's inventory:", err);
                                        return res.status(500).json(err);
                                    }
                                });
                            }

                            // Process trade: decrease sender's offer item and increase sender's requested item
                            model.updateInventory(trade.sender_id, trade.offer_item_id, -trade.offer_quantity, (err) => {
                                if (err) {
                                    console.error("Error updating sender's inventory:", err);
                                    return res.status(500).json(err);
                                }

                                model.updateInventory(trade.sender_id, trade.request_item_id, trade.request_quantity, (err) => {
                                    if (err) {
                                        console.error("Error updating sender's inventory (requested item):", err);
                                        return res.status(500).json(err);
                                    }

                                    // Process trade: decrease recipient's requested item and increase recipient's offer item
                                    model.updateInventory(trade.recipient_id, trade.request_item_id, -trade.request_quantity, (err) => {
                                        if (err) {
                                            console.error("Error updating recipient's inventory:", err);
                                            return res.status(500).json(err);
                                        }

                                        model.updateInventory(trade.recipient_id, trade.offer_item_id, trade.offer_quantity, (err) => {
                                            if (err) {
                                                console.error("Error updating recipient's inventory (offer item):", err);
                                                return res.status(500).json(err);
                                            }

                                            // Update trade status to accepted
                                            model.updateTradeStatus(trade_id, 'accepted', (error) => {
                                                if (error) {
                                                    console.error("Error updating trade status:", error);
                                                    return res.status(500).json(error);
                                                }

                                                res.status(200).json({ message: "Trade accepted and inventory updated." });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        } else {
            // Update trade status to declined
            model.updateTradeStatus(trade_id, 'declined', (error) => {
                if (error) {
                    console.error("Error updating trade status:", error);
                    return res.status(500).json(error);
                }

                res.status(200).json({ message: "Trade declined." });
            });
        }
    });
};