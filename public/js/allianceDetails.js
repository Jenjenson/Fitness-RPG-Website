document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const allianceId = urlParams.get("id");

    if (!allianceId) {
        showToast("Alliance ID is missing in the URL.", "error");
        return;
    }

    const token = localStorage.getItem("token");

    // Fetch Alliance Details
    fetchMethod(`/api/alliances/${allianceId}`, (status, allianceDetails) => {
        const allianceCard = document.getElementById("alliance-card");

        if (status === 200 && allianceDetails) {
            // Populate the alliance card with the details
            document.getElementById("alliance-name").innerText = allianceDetails.name;
            document.getElementById("alliance-description").innerText = allianceDetails.description;
            document.getElementById("alliance-leader").innerText = `Leader: ${allianceDetails.leader_name}`;
            document.getElementById("alliance-total-members").innerText = `Total Members: ${allianceDetails.total_members}`;
        } else {
            allianceCard.innerHTML = `<div class="card-body"><h5 class="card-title">Alliance Not Found</h5><p>No details available.</p></div>`;
        }
    }, "GET", null, token);

    // Fetch Alliance Members
    fetchMethod(`/api/alliances/${allianceId}/members`, (status, members) => {
        const membersContainer = document.getElementById("members-container");

        if (status === 200 && members && members.length > 0) {
            // Create a card for each member
            members.forEach(member => {
                const memberCol = document.createElement("div");
                memberCol.classList.add("col-md-4", "mb-4");

                memberCol.innerHTML = `
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${member.username}</h5>
                            <p class="card-text">Role: ${member.role}</p>
                            <p class="card-text">Level: ${member.level}</p>
                        </div>
                    </div>
                `;

                membersContainer.appendChild(memberCol);
            });
        } else {
            membersContainer.innerHTML = `<div class="col-12"><p>No members found for this alliance.</p></div>`;
        }
    }, "GET", null, token);
});
