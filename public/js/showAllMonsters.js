document.addEventListener("DOMContentLoaded", () => {
    // Fetch and display all monsters
    fetchMethod(
      "/api/monster",
      (status, data) => {
        if (status === 200) {
          const monsterContainer = document.getElementById("monster-container");
          monsterContainer.innerHTML = ""; // Clear existing monster list
  
          // Loop through each monster and create cards for display
          data.forEach((monster) => {
            const monsterCard = document.createElement("div");
            monsterCard.classList.add("col-md-4", "mb-4");
  
            // Monster card content
            const monsterImage = `<img src="../img/monster${monster.monster_id}.png" class="card-img-top monster-image" alt="${monster.name}" style="max-height: 350px; object-fit: cover;">`;
  
            monsterCard.innerHTML = `
              <div class="card h-100">
                ${monsterImage}
                <div class="card-body">
                  <h5 class="card-title">${monster.name}</h5>
                  <p class="card-text"><strong>Level:</strong> ${monster.level}</p>
                  <p class="card-text"><strong>HP:</strong> ${monster.HP}</p>
                  <p class="card-text"><strong>STR:</strong> ${monster.STR}</p>
                  <p class="card-text"><strong>DEF:</strong> ${monster.DEF}</p>
                  <p class="card-text"><strong>EXP (Skillpoints):</strong> ${monster.EXP}</p>
                  <p class="card-text"><strong>Drop Item:</strong> ${monster.drop_item}</p>
                  <button class="btn btn-danger fight-button" data-monster-id="${monster.monster_id}">Fight</button>
                </div>
              </div>
            `;
  
            // Append the card to the container
            monsterContainer.appendChild(monsterCard);
          });
  
          // Add event listeners to the fight buttons
          const fightButtons = document.querySelectorAll(".fight-button");
          fightButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
              const monsterId = e.target.getAttribute("data-monster-id");
              fightMonster(monsterId); // Call the fightMonster function when clicked
            });
          });
        } else {
          console.error("Error fetching monsters:", status);
        }
      },
      "GET",
      null,
      localStorage.getItem("token")
    );
  
    // Function to fight a monster
    function fightMonster(monsterId) {
      fetchMethod(
        `/api/monster/${monsterId}`,
        (status, data) => {
          if (status === 200) {
            // Display success notification with rewards
            const rewardMessage = `🎉 Victory!
              EXP Gained: ${data.reward.exp}
              ${data.reward.itemDropped ? `Item Dropped: ${data.reward.itemDropped}` : ""}
            `;
            showToast(rewardMessage, "success");
          } else {
            // Display failure notification
            showToast(`❌ You were defeated by the monster!`, "danger");
            console.error("Error fighting monster:", status, data);
          }
        },
        "POST",
        null,
        localStorage.getItem("token")
      );
    }
  });
  