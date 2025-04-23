document.addEventListener("DOMContentLoaded", function () {
    const leaderboardBody = document.getElementById("leaderboard-body");

    // Function to update the leaderboard with data from the server
    const updateLeaderboard = (users) => {
        leaderboardBody.innerHTML = ""; // Clear existing rows

        users.forEach((user, index) => {
            const row = document.createElement("tr");

            // Create and append rank cell
            const rankCell = document.createElement("td");
            rankCell.textContent = index + 1;
            row.appendChild(rankCell);

            // Create and append username cell
            const usernameCell = document.createElement("td");
            usernameCell.textContent = user.username;
            row.appendChild(usernameCell);

            // Create and append level cell
            const levelCell = document.createElement("td");
            levelCell.textContent = user.level;
            row.appendChild(levelCell);

            // Create and append skillpoints cell
            const skillpointCell = document.createElement("td");
            skillpointCell.textContent = user.skillpoints;
            row.appendChild(skillpointCell);

            const challengesCell = document.createElement("td");
            challengesCell.textContent = user.total_completed_challenges;
            row.appendChild(challengesCell);

            leaderboardBody.appendChild(row);
        });
    };

    // Callback function for fetchMethod
    const handleResponse = (status, data) => {
        if (status === 200) {
            updateLeaderboard(data);
        } else {
            console.error("Failed to fetch leaderboard data", data);
        }
    };

    fetchMethod(currentUrl + "/api/user/top5", handleResponse);
});
