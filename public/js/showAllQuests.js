document.addEventListener("DOMContentLoaded", function () {
    const availableQuests = document.getElementById("availableQuests");
    const userQuests = document.getElementById("userQuests");
    const completedQuests = document.getElementById("completedQuests");

    const callback = (responseStatus, responseData) => {
        console.log("responseStatus:", responseStatus);
        console.log("responseData:", responseData);

        if (responseStatus !== 200) {
            availableQuests.innerHTML =
                "<div class='col-12'><p class='text-center text-danger'>Failed to load quests.</p></div>";
            return;
        }

        const quests = responseData;

        // Categorizing quests properly
        const availableQuestsData = quests.filter((quest) => quest.progress === null || quest.progress === undefined);
        const inProgressQuests = quests.filter(
            (quest) => quest.progress !== null && !quest.completed
        );
        const completedQuestsData = quests.filter((quest) => quest.completed);

        // Function to generate quest cards
        const createQuestCard = (quest, showProgress = false) => {
            return `
                <div class="card shadow">
                    <div class="card-body">
                        <h5 class="card-title">${quest.name}</h5>
                        <p class="card-text">
                            Quest ID: ${quest.quest_id}<br>
                            Description: ${quest.description}<br>
                            ${showProgress ? `Progress: ${quest.progress} / ${quest.target_count}<br>` : ""}<br>
                            Skill Points Reward: ${quest.reward_skillpoints || "None"}<br>
                            Reward Item: ${quest.reward_item_name || "None"}<br>
                            Number of Completions: ${quest.completions} 
                        </p>
                        ${!showProgress ? `<button class="btn btn-success mt-2" onclick="acceptQuest(${quest.quest_id})">Accept Quest</button>` : ""}
                    </div>
                </div>
            `;
        };

        // Display available quests (Not Taken)
        availableQuests.innerHTML = "";
        availableQuestsData.forEach((quest) => {
            const questCard = document.createElement("div");
            questCard.className = "col-xl-3 col-lg-4 col-md-6 col-sm-12 p-3";
            questCard.innerHTML = createQuestCard(quest);
            availableQuests.appendChild(questCard);
        });

        // Display user quests (In Progress)
        userQuests.innerHTML = "";
        inProgressQuests.forEach((quest) => {
            const questCard = document.createElement("div");
            questCard.className = "col-xl-3 col-lg-4 col-md-6 col-sm-12 p-3";
            questCard.innerHTML = createQuestCard(quest, true);
            userQuests.appendChild(questCard);
        });

        // Display completed quests
        completedQuests.innerHTML = "";
        completedQuestsData.forEach((quest) => {
            const questCard = document.createElement("div");
            questCard.className = "col-xl-3 col-lg-4 col-md-6 col-sm-12 p-3";
            questCard.innerHTML = createQuestCard(quest, true);
            completedQuests.appendChild(questCard);
        });
    };

    // Fetch data from the API endpoint
    fetchMethod("/api/quests/categorised", callback, "GET", null, localStorage.getItem("token"));
});

// Function to accept a quest
function acceptQuest(quest_id) {
    if (!quest_id) {
        alert("Invalid quest.");
        return;
    }

    const callback = (responseStatus, responseData) => {
        console.log("responseStatus:", responseStatus);
        console.log("responseData:", responseData);

        if (responseStatus === 200) {
            window.location.reload();
        } else {
            alert("Failed to accept the quest: " + (responseData.error || "Unknown error"));
        }
    };

    fetchMethod(`/api/quests/${quest_id}`, callback, "POST", null, localStorage.getItem("token"));
}
