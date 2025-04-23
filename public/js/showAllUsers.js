document.addEventListener("DOMContentLoaded", function () {
    const userContainer = document.getElementById("userContainer");

    fetchMethod("/api/user", (status, users) => {
        if (status === 200 && Array.isArray(users) && users.length > 0) {
            users.forEach(user => {
                const col = document.createElement("div");
                col.classList.add("col-md-4", "mb-4");

                col.innerHTML = `
                    <div class="card shadow-lg">
                        <div class="card-body">
                            <h5 class="card-title">${user.username}</h5>
                            <p class="card-text">Level: ${user.level}</p>
                            <p class="card-text">Skill Points: ${user.skillpoints}</p>
                            <p class="card-text">Strength: ${user.STR}</p>
                            <p class="card-text">Health: ${user.HP}</p>
                            <p class="card-text">Defense: ${user.DEF}</p>
                            <p class="card-text"><strong>Alliance:</strong> ${user.alliance || "None"}</p>
                            <a href="userDetails.html?id=${user.user_id}" class="btn btn-primary">View Details</a>
                        </div>
                    </div>
                `;

                userContainer.appendChild(col);
            });
        } else {
            userContainer.innerHTML = `<p>No users found.</p>`;
        }
    });
});
