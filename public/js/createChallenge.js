document.addEventListener("DOMContentLoaded", function () {
    const challengesHeader = document.querySelector(".challenges-header"); // Target the Challenges section

    if (!challengesHeader) return; // Ensure the section exists

    // Create the "Create Challenge" button
    const createChallengeButton = document.createElement("button");
    createChallengeButton.className = "btn btn-primary ms-3"; // Add margin for spacing
    createChallengeButton.textContent = "Create Challenge";
    createChallengeButton.setAttribute("data-bs-toggle", "modal");
    createChallengeButton.setAttribute("data-bs-target", "#createChallengeModal");

    // Insert the button next to the Challenges heading
    challengesHeader.appendChild(createChallengeButton);

    // Modal HTML structure
    const modalHTML = `
      <div class="modal fade" id="createChallengeModal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Create a Challenge</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="createChallengeForm">
                <div class="mb-3">
                  <label for="challengeName" class="form-label">Challenge Name</label>
                  <input type="text" class="form-control" id="challengeName" required>
                </div>
                <div class="mb-3">
                  <label for="skillpoints" class="form-label">Skill Points (max: 300)</label>
                  <input type="number" class="form-control" id="skillpoints" min="1" max="300" required>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" class="btn btn-primary">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Form submission logic
    document.getElementById("createChallengeForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const challenge = document.getElementById("challengeName").value.trim();
        const skillpoints = parseInt(document.getElementById("skillpoints").value, 10);

        if (skillpoints > 300) {
            showToast("Skill points cannot exceed 300.", "error");
            return;
        }

        const requestBody = { challenge, skillpoints };

        const callback = (responseStatus, responseData) => {
            if (responseStatus === 201) {
                window.location.reload();
            } else {
                showToast("Failed to create challenge: " + (responseData.error || "Unknown error"), "error");
            }
        };

        fetchMethod("/api/challenges", callback, "POST", requestBody, localStorage.getItem("token"));
    });
});
