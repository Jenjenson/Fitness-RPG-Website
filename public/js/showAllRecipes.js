document.addEventListener("DOMContentLoaded", function () {
    const recipesContainer = document.getElementById("recipesContainer");

    fetchMethod("/api/crafting", (status, recipes) => {
        if (status === 200 && Array.isArray(recipes) && recipes.length > 0) {
            // Group ingredients by recipe_id
            const groupedRecipes = groupIngredientsByRecipe(recipes);

            Object.keys(groupedRecipes).forEach(recipeId => {
                const recipe = groupedRecipes[recipeId][0]; // Use the first item to get recipe info
                const ingredients = groupedRecipes[recipeId];

                const col = document.createElement("div");
                col.classList.add("col-md-4", "mb-4");

                col.innerHTML = `
                    <div class="card shadow-lg">
                        <div class="card-body">
                            <h5 class="card-title">${recipe.crafted_item_name}</h5>
                            <p class="card-text">Crafted Item ID: ${recipe.crafted_item_id}</p>
                            <p class="card-text"><strong>Ingredients:</strong></p>
                            <ul>
                                ${ingredients.map(ingredient => `
                                    <li>${ingredient.ingredient_name} - ${ingredient.quantity_required}</li>
                                `).join('')}
                            </ul>
                            <button class="btn btn-primary" onclick="craftItem(${recipe.recipe_id})">Craft</button>
                        </div>
                    </div>
                `;

                recipesContainer.appendChild(col);
            });
        } else {
            recipesContainer.innerHTML = `<p>No crafting recipes found.</p>`;
        }
    });
});

function groupIngredientsByRecipe(recipes) {
    return recipes.reduce((acc, recipe) => {
        if (!acc[recipe.recipe_id]) {
            acc[recipe.recipe_id] = [];
        }
        acc[recipe.recipe_id].push(recipe);
        return acc;
    }, {});
}

function craftItem(recipe_id) {
    const payload = { recipe_id };

    fetchMethod("/api/crafting", (status, response) => {
        if (status === 200) {
            showToast("Item crafted successfully!", "success");
        } else {
            showToast(`Error crafting item: ${response.error}`, "error");
        }
    }, "PUT", payload, localStorage.getItem("token"));  // Ensure 'PUT' is passed here correctly
}

