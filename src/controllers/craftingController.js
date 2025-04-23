const craftingModel = require('../models/craftingModel');

//////////////////////////////////////////////////////
// CONTROLLER TO GET ALL CRAFTING RECIPES
//////////////////////////////////////////////////////
module.exports.getAllCraftingRecipes = (req, res) => {
    craftingModel.getAllRecipes((error, result) => {
        if (error) {
            return res.status(500).json({ error: 'Error fetching crafting recipes.', details: error });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'No crafting recipes found.' });
        }

        res.status(200).json(result);
    });
};

//////////////////////////////////////////////////////
// CONTROLLER TO CRAFT ITEM
//////////////////////////////////////////////////////
module.exports.craftItem = (req, res) => {
    const { recipe_id } = req.body;  // Recipe ID is provided in the request body
    const user_id = res.locals.userId;  // Get user ID from the session (or token)

    if (!recipe_id) {
        return res.status(400).json({ error: "Invalid request data." });
    }

    // Step 1: Get the crafting recipe ingredients
    craftingModel.getRecipeIngredients(recipe_id, (error, ingredients) => {
        if (error) {
            return res.status(500).json({ error: 'Error fetching recipe ingredients.', details: error });
        }

        if (ingredients.length === 0) {
            return res.status(404).json({ error: 'No ingredients found for this recipe.' });
        }

        // Step 2: Check if the user has enough materials
        const checkMaterials = (index) => {
            if (index >= ingredients.length) {
                // All materials checked, proceed to deduct and craft
                deductMaterials(0);
                return;
            }

            const ingredient = ingredients[index];
            craftingModel.checkMaterials(user_id, ingredient.ingredient_item_id, (error, result) => {
                if (error) {
                    return res.status(500).json({ error: 'Error checking materials.', details: error });
                }

                if (result.length === 0 || result[0].quantity < ingredient.quantity_required) {
                    return res.status(400).json({ error: `Not enough material: ${ingredient.ingredient_name}` });
                }

                // Proceed to the next material check
                checkMaterials(index + 1);
            });
        };

        // Step 3: Deduct materials from the user's inventory
        const deductMaterials = (index) => {
            if (index >= ingredients.length) {
                // All materials deducted, proceed to add the crafted item
                addCraftedItem();
                return;
            }

            const ingredient = ingredients[index];
            craftingModel.deductMaterials(user_id, ingredient.ingredient_item_id, ingredient.quantity_required, (error, result) => {
                if (error) {
                    return res.status(500).json({ error: 'Error deducting materials.', details: error });
                }

                // Proceed to the next material deduction
                deductMaterials(index + 1);
            });
        };

        // Step 4: Add the crafted item to the user's inventory
        const addCraftedItem = () => {
            const crafted_item_id = ingredients[0].crafted_item_id;  // The crafted item from the recipe
            craftingModel.addCraftedItem(user_id, crafted_item_id, 1, (error, result) => {
                if (error) {
                    return res.status(500).json({ error: 'Error adding crafted item.', details: error });
                }

                // Return the response with the crafted item details
                res.status(200).json({message: 'Item crafted successfully!'});
            });
        };

        // Start by checking material availability
        checkMaterials(0);
    });
};
