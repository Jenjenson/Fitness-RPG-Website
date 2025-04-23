document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    let userInAlliance = false;

    // Fetch the current user's alliance and role
    fetchMethod("/api/alliances/user", (status, userAlliance) => {
        const allianceDetailsContainer = document.getElementById("your-alliance");

        if (status === 200 && userAlliance && Object.keys(userAlliance).length > 0) {
            userInAlliance = true;
            allianceDetailsContainer.innerHTML = `
                <h5 class="card-title" id="alliance-name">${userAlliance.name}</h5>
                <p id="alliance-description">${userAlliance.description}</p>
                <p id="alliance-leader">Leader: ${userAlliance.leader_name}</p>
                <p id="alliance-role">Role: ${userAlliance.role}</p>
                <p id="alliance-total-members">Total Members: ${userAlliance.total_members}</p>
            `;

            // "Show Details" button
            const detailsButton = document.createElement("a");
            detailsButton.href = `allianceDetails.html?id=${userAlliance.alliance_id}`;
            detailsButton.classList.add("btn", "btn-primary", "me-2");
            detailsButton.textContent = "Show Details";
            allianceDetailsContainer.appendChild(detailsButton);

            // "Leave Alliance" button
            const leaveButton = document.createElement("button");
            leaveButton.classList.add("btn", "btn-danger");
            leaveButton.textContent = "Leave Alliance";

            // Check if the user is the leader
            if (userAlliance.role === "Leader") {
                if (userAlliance.total_members > 1) {
                    // More than one member, require leadership transfer
                    leaveButton.addEventListener("click", function () {
                        showToast("You must transfer leadership before leaving.", "error");
                        showTransferLeadershipModal(userAlliance.alliance_id);
                    });

                    // "Transfer Ownership" button
                    const transferButton = document.createElement("button");
                    transferButton.classList.add("btn", "btn-warning", "me-2");
                    transferButton.textContent = "Transfer Ownership";
                    transferButton.addEventListener("click", function () {
                        showTransferLeadershipModal(userAlliance.alliance_id);
                    });

                    allianceDetailsContainer.appendChild(transferButton);
                } else {
                    // Only one member, allow leader to leave without transferring ownership
                    leaveButton.addEventListener("click", function () {
                        fetchMethod(`/api/alliances/leave/${userAlliance.alliance_id}`, (status) => {
                            if (status === 200) {
                                showToast("You have left the alliance.", "success");
                                location.reload();
                            } else {
                                showToast("Error leaving alliance.", "error");
                            }
                        }, "DELETE", null, token);
                    });
                }
            } else {
                // Non-leader members can leave freely
                leaveButton.addEventListener("click", function () {
                    fetchMethod(`/api/alliances/leave/${userAlliance.alliance_id}`, (status) => {
                        if (status === 200) {
                            showToast("You have left the alliance.", "success");
                            location.reload();
                        } else {
                            showToast("Error leaving alliance.", "error");
                        }
                    }, "DELETE", null, token);
                });
            }

            allianceDetailsContainer.appendChild(leaveButton);

        } else {
            userInAlliance = false;
            allianceDetailsContainer.innerHTML = `
                <h5 class="card-title">Not in an alliance</h5>
                <p>Join or create an alliance to see details here.</p>
            `;

            // "Create Alliance" button
            const createButton = document.createElement("button");
            createButton.classList.add("btn", "btn-success");
            createButton.textContent = "Create Alliance";
            createButton.addEventListener("click", showCreateAllianceModal);
            allianceDetailsContainer.appendChild(createButton);
        }

        // Fetch all alliances after user status is set
        fetchAllAlliances(userInAlliance);
    }, "GET", null, token);

    function fetchAllAlliances(userInAlliance) {
        fetchMethod("/api/alliances", (status, alliances) => {
            const allianceContainer = document.getElementById("alliance-container");
            allianceContainer.innerHTML = "";

            if (status === 200 && alliances.length > 0) {
                alliances.forEach(alliance => {
                    const col = document.createElement("div");
                    col.classList.add("col-md-4", "mb-4");

                    const joinButton = userInAlliance
                        ? `<button class="btn btn-secondary" disabled>Already Joined</button>`
                        : `<button class="btn btn-success join-btn" data-id="${alliance.alliance_id}">Join</button>`;

                    col.innerHTML = `
                        <div class="card shadow-lg">
                            <div class="card-body">
                                <h5 class="card-title">${alliance.name}</h5>
                                <p class="card-text">${alliance.description}</p>
                                <p class="text-muted">Leader: ${alliance.leader_name}</p>
                                <p class="text-muted">Total Members: ${alliance.total_members}</p>
                                <div class="d-flex justify-content-between">
                                    ${joinButton}
                                    <button class="btn btn-primary details-btn" data-id="${alliance.alliance_id}">Show Details</button>
                                </div>
                            </div>
                        </div>
                    `;

                    allianceContainer.appendChild(col);
                });

                // Attach event listeners for "Join" buttons
                document.querySelectorAll(".join-btn").forEach(button => {
                    button.addEventListener("click", function () {
                        const allianceId = this.getAttribute("data-id");
                        fetchMethod(`/api/alliances/join/${allianceId}`, (status) => {
                            if (status === 200) {
                                showToast("Joined alliance successfully!", "success");
                                location.reload();
                            } else {
                                showToast("Error joining alliance.", "error");
                            }
                        }, "POST", null, token);
                    });
                });

                // Attach event listeners for "Details" buttons
                document.querySelectorAll(".details-btn").forEach(button => {
                    button.addEventListener("click", function () {
                        const allianceId = this.getAttribute("data-id");
                        window.location.href = `allianceDetails.html?id=${allianceId}`;
                    });
                });
            } else {
                allianceContainer.innerHTML = `<p>No alliances available at the moment.</p>`;
            }
        }, "GET", null, token);
    }
    
    function showCreateAllianceModal() {
        // Create a modal dynamically
        const modal = document.createElement("div");
        modal.className = "modal fade";
        modal.id = "createAllianceModal";
        modal.setAttribute("tabindex", "-1");
        modal.setAttribute("role", "dialog");
        modal.innerHTML = `
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Create Alliance</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="allianceName" class="form-label">Alliance Name:</label>
                            <input type="text" id="allianceName" class="form-control" placeholder="Enter alliance name">
                        </div>
                        <div class="mb-3">
                            <label for="allianceDescription" class="form-label">Description:</label>
                            <textarea id="allianceDescription" class="form-control" placeholder="Enter alliance description" rows="3"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" id="submitCreateAlliance">Create</button>
                    </div>
                </div>
            </div>
        `;

        // Append the modal to the body
        document.body.appendChild(modal);

        // Initialize Bootstrap modal
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();

        // Handle form submission
        document.getElementById("submitCreateAlliance").addEventListener("click", () => {
            const name = document.getElementById("allianceName").value.trim();
            const description = document.getElementById("allianceDescription").value.trim();

            // Validate input
            if (name === "" || description === "") {
                showToast("Please fill out both fields.", "error");
                return;
            }

            // Prepare the request body
            const allianceData = { name, description };

            // Send the request
            fetchMethod("/api/alliances", (status, response) => {
                if (status === 200) {
                    showToast("Alliance created successfully!", "success");
                    location.reload();
                } else {
                    showToast(`Error creating alliance: ${response.message}`, "error");
                }
            }, "POST", allianceData, token);

            // Hide and remove the modal
            bootstrapModal.hide();
            modal.remove();
        });
    }

    function showTransferLeadershipModal(allianceId) {
        fetchMethod(`/api/alliances/${allianceId}/members`, (status, members) => {
            if (status !== 200 || members.length <= 1) {
                showToast("No other members available to transfer leadership.", "error");
                return;
            }
    
            // Create the modal
            const modal = document.createElement("div");
            modal.className = "modal fade";
            modal.id = "transferLeadershipModal";
            modal.setAttribute("tabindex", "-1");
            modal.setAttribute("role", "dialog");
            modal.innerHTML = `
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Transfer Leadership</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <label for="newLeader" class="form-label">Select New Leader:</label>
                            <select id="newLeader" class="form-select">
                                ${members
                                    .filter(member => member.role !== "leader") // Exclude current leader
                                    .map(member => `<option value="${member.user_id}">${member.username}</option>`)
                                    .join("")}
                            </select>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-success" id="confirmTransfer">Transfer</button>
                        </div>
                    </div>
                </div>
            `;
    
            document.body.appendChild(modal);
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
    
            document.getElementById("confirmTransfer").addEventListener("click", () => {
                const newLeaderId = document.getElementById("newLeader").value;
                if (!newLeaderId) {
                    showToast("Please select a new leader.", "error");
                    return;
                }
    
                // Transfer leadership
                fetchMethod(`/api/alliances/${allianceId}/leader`, (status) => {
                    if (status === 200) {
                        // Update the UI without reloading the page
                        const allianceName = document.getElementById("alliance-name");
                        const allianceLeader = document.getElementById("alliance-leader");
    
                        // Find the new leader from the members
                        const newLeader = members.find(member => member.user_id === parseInt(newLeaderId));
                        if (newLeader) {
                            allianceLeader.innerText = `Leader: ${newLeader.username}`;
                        }
    
                        showToast("Leadership transferred successfully.", "success");
    
                        // Close the modal and remove it from DOM
                        bootstrapModal.hide();
                        modal.remove();
                        location.reload()
                    } else {
                        showToast("Error transferring leadership.", "error");
                    }
                }, "PUT", { user_id: newLeaderId }, token);
            });
        }, "GET", null, token);
    }
});
