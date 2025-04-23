document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const challengeId = urlParams.get("challenge_id");

    // Fetch challenge details using fetchMethod
    fetchMethod(`/api/challenges/${challengeId}`, (status, data) => {
        if (status === 200) {
            document.getElementById("challengeTitle").textContent = data.challenge;
            document.getElementById("challengeDescription").textContent = data.description;
            document.getElementById("skillPoints").textContent = data.skillpoints;
            document.getElementById("creatorId").textContent = data.creator_id;
            document.getElementById("averageRating").textContent = parseFloat(data.average_rating).toFixed(1);
        } else {
            console.error("Failed to fetch challenge details:", status);
        }
    });

    // Fetch number of completions using fetchMethod
    fetchMethod(`/api/challenges/${challengeId}/completions`, (status, data) => {
        if (status === 200) {
            document.getElementById("completionsCount").textContent = data.completion_count || "0";

            // Create a container div for buttons
            const containerDiv = document.createElement("div");
            containerDiv.className = "mt-3 d-flex gap-2"; // Adds spacing

            // Edit Challenge Button
            const editButton = document.createElement("button");
            editButton.className = "btn btn-warning";
            editButton.textContent = "Edit Challenge";
            editButton.setAttribute("data-bs-toggle", "modal");
            editButton.setAttribute("data-bs-target", "#editChallengeModal");

            // Delete Challenge Button
            const deleteButton = document.createElement("button");
            deleteButton.className = "btn btn-danger";
            deleteButton.textContent = "Delete Challenge";
            deleteButton.addEventListener("click", function () {
                if (confirm("Are you sure you want to delete this challenge? This action cannot be undone.")) {
                    fetchMethod(`/api/challenges/${challengeId}`, (status, data) => {
                        if (status === 204) {
                            alert("Challenge deleted successfully!");
                            window.location.href = "/challenges.html"; // Redirect to challenge list page
                        } else {
                            showToast("Failed to delete challenge: " + (data.error || "Unknown error"), 'error');
                        }
                    }, "DELETE", null, localStorage.getItem("token"));
                }
            });

            // Append buttons to container
            containerDiv.appendChild(editButton);
            containerDiv.appendChild(deleteButton);

            // Insert container below completions count
            const completionsCountElement = document.getElementById("completionsCount");
            completionsCountElement.parentNode.appendChild(containerDiv);
        } else {
            console.error("Failed to fetch completions count:", status);
        }
    });

    // Fetch reviews using fetchMethod
    fetchMethod(`/api/challenges/${challengeId}/reviews`, (status, data) => {
        if (status === 200) {
            const reviewsSection = document.getElementById("reviewsSection");

            // Add a row container to hold review cards side by side
            const rowDiv = document.createElement("div");
            rowDiv.className = "row";

            data.forEach(review => {
                const reviewCard = document.createElement("div");
                reviewCard.className = "col-xl-3 col-lg-4 col-md-6 col-sm-12 p-3";

                reviewCard.innerHTML = `
                    <div class="card shadow">
                        <div class="card-body">
                            <h5 class="card-title">Review by User ID: ${review.user_id}</h5>
                            <p class="card-text">
                                <strong>Rating:</strong> ${review.rating} / 5<br>
                                <strong>Notes:</strong> ${review.notes}<br>
                                <small><strong>Reviewed on:</strong> ${new Date(review.creation_date).toLocaleString()}</small>
                            </p>
                        </div>
                    </div>
                `;
                rowDiv.appendChild(reviewCard);
            });

            // Append the row of review cards to the reviews section
            reviewsSection.appendChild(rowDiv);
        } else {
            console.error("Failed to fetch reviews:", status);
        }
    });

    // Edit Challenge Modal
    const editModalHTML = `
        <div class="modal fade" id="editChallengeModal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Challenge</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editChallengeForm">
                            <div class="mb-3">
                                <label for="editChallengeName" class="form-label">Challenge Name</label>
                                <input type="text" class="form-control" id="editChallengeName" required>
                            </div>
                            <div class="mb-3">
                                <label for="editSkillPoints" class="form-label">Skill Points (max: 300)</label>
                                <input type="number" class="form-control" id="editSkillPoints" min="1" max="300" required>
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

    document.body.insertAdjacentHTML("beforeend", editModalHTML);

    // Prefill modal inputs with current challenge data
    document.addEventListener("show.bs.modal", function (event) {
        if (event.target.id === "editChallengeModal") {
            fetchMethod(`/api/challenges/${challengeId}`, (status, data) => {
                if (status === 200) {
                    document.getElementById("editChallengeName").value = data.challenge;
                    document.getElementById("editSkillPoints").value = data.skillpoints;
                } else {
                    console.error("Failed to fetch challenge details for editing:", status);
                }
            });
        }
    });

    // Handle Edit Challenge Form Submission
    document.getElementById("editChallengeForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const updatedChallenge = document.getElementById("editChallengeName").value.trim();
        const updatedSkillPoints = parseInt(document.getElementById("editSkillPoints").value, 10);

        if (updatedSkillPoints > 300) {
            showToast("Skill points cannot exceed 300.", "error");
            return;
        }

        const requestBody = { challenge: updatedChallenge, skillpoints: updatedSkillPoints };

        fetchMethod(`/api/challenges/${challengeId}/edit`, (status, data) => {
            if (status === 200) {
                window.location.reload();
            } else {
                showToast("Failed to update challenge: " + (data.error || "Unknown error"), "error");
            }
        }, "PUT", requestBody, localStorage.getItem("token"));
    });
});
