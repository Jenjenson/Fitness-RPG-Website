document.addEventListener("DOMContentLoaded", function () {
    // Function to update the stats card with data from the server
    const updateStats = (completedChallenges, totalUsers, collectedItems) => {
        // Update the individual stats in the card
        const completedChallengesElement = document.getElementById("challenges-completed");
        const totalUsersElement = document.getElementById("total-users");
        const collectedItemsElement = document.getElementById("items-collected");

        completedChallengesElement.textContent = completedChallenges;
        totalUsersElement.textContent = totalUsers;
        collectedItemsElement.textContent = collectedItems;
    };

    // Fetch all stats data from the three URLs
    const fetchStats = () => {
        // Fetch completed challenges
        fetchMethod(currentUrl + "/api/challenges/completed", (status, completedData) => {
            if (status !== 200) {
                console.error("Failed to fetch completed challenges", completedData);
                return;
            }

            const completedChallenges = completedData.completed_count;

            // Fetch total users
            fetchMethod(currentUrl + "/api/user/count", (status, userData) => {
                if (status !== 200) {
                    console.error("Failed to fetch total users", userData);
                    return;
                }

                const totalUsers = userData.totalUsers;

                // Fetch collected items
                fetchMethod(currentUrl + "/api/inventory/count", (status, inventoryData) => {
                    if (status !== 200) {
                        console.error("Failed to fetch collected items", inventoryData);
                        return;
                    }

                    const collectedItems = inventoryData.collectedItems;

                    // Update the stats card with all data once fetched
                    updateStats(completedChallenges, totalUsers, collectedItems);
                });
            });
        });
    };

    // Call the function to fetch stats
    fetchStats();
});
