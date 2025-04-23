document.addEventListener("DOMContentLoaded", function () {
    const outgoingTradesContainer = document.getElementById("outgoingTrades");
    const incomingTradesContainer = document.getElementById("incomingTrades");

    // Fetch user ID from a dedicated API route (e.g., /api/user/me)
    fetchMethod("/api/user/me", (responseStatus, responseData) => {
        if (responseStatus !== 200 || !responseData.user_id) {
            console.error("Failed to retrieve user ID");
            return;
        }

        const currentUserId = responseData.user_id;

        // Fetch trades
        fetchMethod("/api/trade", (tradeStatus, tradeData) => {
            console.log("Trade response:", tradeData);

            if (tradeStatus !== 200 || !Array.isArray(tradeData)) {
                outgoingTradesContainer.innerHTML = `<div class='col-12 text-center text-danger'>Failed to load trades.</div>`;
                incomingTradesContainer.innerHTML = `<div class='col-12 text-center text-danger'>Failed to load trades.</div>`;
                return;
            }

            const outgoingTrades = tradeData.filter(trade => trade.sender_id === currentUserId);
            const incomingTrades = tradeData.filter(trade => trade.recipient_id === currentUserId);

            // Display outgoing trades
            outgoingTrades.forEach(trade => {
                const tradeCard = document.createElement("div");
                tradeCard.className = "col-xl-3 col-lg-4 col-md-6 col-sm-12 p-3";
            
                // Set badge color based on status
                let badgeClass = '';
                switch (trade.status) {
                    case 'accepted': badgeClass = 'bg-success'; break;
                    case 'declined': badgeClass = 'bg-danger'; break;
                    case 'pending': badgeClass = 'bg-warning'; break;
                    default: badgeClass = 'bg-info'; break;
                }
            
                tradeCard.innerHTML = `
                    <div class="card shadow">
                        <div class="card-body">
                            <h5 class="card-title">Trade with User ${trade.recipient_id}</h5>
                            <p class="card-text">
                                You offered: ${trade.offer_quantity}x ${trade.offer_item_name} <br>
                                In exchange for: ${trade.request_quantity}x ${trade.request_item_name}
                            </p>
                            <span class="badge ${badgeClass}">${trade.status}</span>
                        </div>
                    </div>
                `;
            
                outgoingTradesContainer.appendChild(tradeCard);
            });            

            incomingTrades.forEach(trade => {
                const tradeCard = document.createElement("div");
                tradeCard.className = "col-xl-3 col-lg-4 col-md-6 col-sm-12 p-3";
                
                // Set badge color based on status
                let badgeClass = '';
                switch (trade.status) {
                    case 'accepted': badgeClass = 'bg-success'; break;
                    case 'declined': badgeClass = 'bg-danger'; break;
                    case 'pending': badgeClass = 'bg-warning'; break;
                    default: badgeClass = 'bg-info'; break;
                }
            
                // Only show buttons if trade is pending
                const actionButtons = trade.status === "pending"
                    ? `
                        <br><br>
                        <button class="btn btn-success btn-sm" onclick="acceptTrade(${trade.trade_id})">Accept</button>
                        <button class="btn btn-danger btn-sm" onclick="rejectTrade(${trade.trade_id})">Reject</button>
                      `
                    : ""; // If accepted/declined, no buttons
            
                tradeCard.innerHTML = `
                    <div class="card shadow">
                        <div class="card-body">
                            <h5 class="card-title">Trade from User ${trade.sender_id}</h5>
                            <p class="card-text">
                                They offered: ${trade.offer_quantity}x ${trade.offer_item_name} <br>
                                In exchange for: ${trade.request_quantity}x ${trade.request_item_name}
                            </p>
                            <span class="badge ${badgeClass}">${trade.status}</span>
                            ${actionButtons} <!-- Buttons only if pending -->
                        </div>
                    </div>
                `;
            
                incomingTradesContainer.appendChild(tradeCard);
            });            

        }, "GET", null, localStorage.getItem("token"));
    }, "GET", null, localStorage.getItem("token"));
});

// Function to accept a trade
function acceptTrade(trade_id) {
    const callback = (status, data) => {
        if (status === 200) {
            showToast("Trade accepted successfully!", "success");
            setTimeout(() => window.location.reload(), 2000); // Delay reload to allow toast visibility
        } else {
            showToast("Failed to accept trade: " + (data.error || "Unknown error"), "error");
        }
    };

    fetchMethod(`/api/trade/${trade_id}/status`, callback, "PUT", { status: 'accepted' }, localStorage.getItem("token"));
}

// Function to reject a trade
function rejectTrade(trade_id) {
    const callback = (status, data) => {
        if (status === 200) {
            showToast("Trade rejected successfully!", "success");
            setTimeout(() => window.location.reload(), 2000); // Delay reload to allow toast visibility
        } else {
            showToast("Failed to reject trade: " + (data.error || "Unknown error"), "error");
        }
    };

    fetchMethod(`/api/trade/${trade_id}/status`, callback, "PUT", { status: 'declined' }, localStorage.getItem("token"));
}
