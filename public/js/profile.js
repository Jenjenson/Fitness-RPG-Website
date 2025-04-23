document.addEventListener("DOMContentLoaded", function () {
    // Function to fetch user data
    const fetchUserData = () => {
        fetchMethod("/api/user/profile", (status, data) => {
            console.log(data);
            if (status === 200) {
                document.getElementById("user-name").textContent = `Username: ${data.username}`;
                document.getElementById("user-email").textContent = `Email: ${data.email}`;
                document.getElementById("user-level").textContent = `Level: ${data.level}`;
                document.getElementById("user-skillpoints").textContent = `Skillpoints: ${data.skillpoints}`;
                document.getElementById("user-hp").textContent = `HP: ${data.HP}`;
                document.getElementById("user-str").textContent = `STR: ${data.STR}`;
                document.getElementById("user-def").textContent = `DEF: ${data.DEF}`;
                document.getElementById("user-alliance").textContent = data.alliance_name 
                    ? `Name: ${data.alliance_name}` 
                    : "Name: No Alliance";
            } else {
                console.error("Error fetching user data:", data);
            }
        }, "GET", null, localStorage.getItem("token"));
    };

    // Insert the Change Username Modal into the page
    const usernameModalHTML = `
        <div class="modal fade" id="changeUsernameModal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Change Username</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="changeUsernameForm">
                            <div class="mb-3">
                                <label for="new-username" class="form-label">New Username</label>
                                <input type="text" class="form-control" id="new-username" required>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", usernameModalHTML);

    // Open Modal when clicking "Change Username" button
    document.getElementById("change-username-btn").addEventListener("click", function () {
        const usernameModal = new bootstrap.Modal(document.getElementById("changeUsernameModal"));
        usernameModal.show();
    });

    // Prefill modal input with current username when modal is shown
    document.addEventListener("show.bs.modal", function (event) {
        if (event.target.id === "changeUsernameModal") {
            fetchMethod("/api/user/profile", (status, data) => {
                if (status === 200) {
                    document.getElementById("new-username").value = data.username;
                } else {
                    console.error("Failed to fetch user data:", status);
                }
            });
        }
    });

    // Handle Username Update
    document.getElementById("changeUsernameForm").addEventListener("submit", function (event) {
        event.preventDefault();
    
        const newUsername = document.getElementById("new-username").value.trim();
        if (newUsername === "") {
            showToast("Username cannot be empty!", "error");
            return;
        }
    
        // Send PUT request to update username
        fetchMethod("/api/user/username", (status, response) => {
            if (status === 200) {
                showToast("Username Updated Successfully!", "success");
                document.getElementById("user-name").textContent = `Username: ${newUsername}`;
    
                // Hide the modal properly
                const usernameModal = bootstrap.Modal.getInstance(document.getElementById("changeUsernameModal"));
                if (usernameModal) usernameModal.hide();
            } else {
                showToast(`Failed to update username! ${response.error}`, "error");
            }
        }, "PUT", { username: newUsername }, localStorage.getItem("token"));
    });
    

    // Fetch user data on page load
    fetchUserData();
});
