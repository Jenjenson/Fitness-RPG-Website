document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const user_id = urlParams.get("id");

    if (!user_id) {
        console.error("User ID not found in URL.");
        return;
    }

    // Fetch user profile
    fetchMethod(`/api/user/profile/${user_id}`, (status, data) => {
        if (status === 200) {
            document.getElementById("username").innerText = data.username;
            document.getElementById("level").innerText = data.level;
            document.getElementById("skillpoints").innerText = data.skillpoints;
            document.getElementById("strength").innerText = data.STR;
            document.getElementById("health").innerText = data.HP;
            document.getElementById("defense").innerText = data.DEF;
            document.getElementById("alliance").innerText = data.alliance_name || "None";
        } else {
            console.error("Error fetching user profile:", data);
        }
    });

    // Fetch logged-in user's ID from the token
    fetchMethod("/api/user/me", (status, data) => {
        if (status === 200 && data.user_id) {
            const currentUserId = data.user_id;

            // Check if logged-in user is the same as the viewed user
            if (user_id == currentUserId) {
                // Hide the trade button if the user is the same
                const tradeButton = document.getElementById("tradeButton");
                if (tradeButton) {
                    tradeButton.style.display = 'none'; // Hide trade button
                }
            }
        }
    }, "GET", null, localStorage.getItem("token"));

    // Fetch recipient's inventory (the user being viewed)
    fetchMethod(`/api/inventory/${user_id}`, (status, items) => {
        const inventoryContainer = document.getElementById("inventoryContainer");

        if (status === 200 && items.length > 0) {
            items.forEach(item => {
                const col = document.createElement("div");
                col.classList.add("col-md-4", "mb-4");

                col.innerHTML = `
                    <div class="card shadow-lg">
                        <div class="card-body">
                            <h5 class="card-title">${item.name}</h5>
                            <p class="card-text"><strong>Type:</strong> ${item.type}</p>
                            <p class="card-text"><strong>Bonus:</strong> ${item.stat_bonus} ${item.stat_type}</p>
                            <p class="card-text"><strong>Quantity:</strong> ${item.quantity}</p>
                            <p class="card-text">${item.description}</p>
                        </div>
                    </div>
                `;

                inventoryContainer.appendChild(col);
            });
        } else {
            inventoryContainer.innerHTML = `<p class="text-center">No items found.</p>`;
        }
    });

    // Fetch sender's inventory (the logged-in user) with token
    fetchMethod("/api/inventory", (status, senderItems) => {
        if (status === 200) {
            populateTradeDropdowns(senderItems, "offerItem");
        }
    }, "GET", null, localStorage.getItem("token"));

    // Fetch recipient's inventory again for trade dropdown
    fetchMethod(`/api/inventory/${user_id}`, (status, recipientItems) => {
        if (status === 200) {
            populateTradeDropdowns(recipientItems, "requestItem");
        }
    });

    // Populate dropdowns with inventory items
    function populateTradeDropdowns(items, dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        dropdown.innerHTML = '<option value="">Select an item</option>';

        items.forEach(item => {
            const option = document.createElement("option");
            option.value = item.item_id;
            option.textContent = `${item.name} (x${item.quantity})`;
            dropdown.appendChild(option);
        });
    }

    // Handle trade submission
    document.getElementById("tradeForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const tradeData = {
            recipient_id: user_id,
            offer_item_id: offerItem.value,
            offer_quantity: offerQuantity.value,
            request_item_id: requestItem.value,
            request_quantity: requestQuantity.value
        };

        fetchMethod("/api/trade",(status) => {
            showToast(status === 200 ? "Trade request sent!" : "Trade failed", status === 200 ? "success" : "error");
        }, "POST", tradeData, localStorage.getItem("token"));
    });
});
