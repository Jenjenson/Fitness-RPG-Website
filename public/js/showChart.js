document.addEventListener("DOMContentLoaded", () => {
    // Fitness Challenges Chart
    fetchMethod(
      "/api/user/challenges/completions",
      (status, data) => {
        if (status === 200) {
          const ctx1 = document.getElementById("fitnessChallengesChart").getContext("2d");
          new Chart(ctx1, {
            type: "pie",
            data: {
              labels: ["Completed", "Incomplete"],
              datasets: [
                {
                  label: "Fitness Challenges",
                  data: [data.completed, data.incomplete],
                  backgroundColor: [
                    "rgba(76, 175, 80, 1)",
                    "rgba(244, 67, 54, 1)",
                  ],
                },
              ],
            },
          });
        } else {
          console.error("Error fetching fitness challenges data:", status);
        }
      },
      "GET",
      null,
      localStorage.getItem("token")
    );
  
    // Quests Chart
    fetchMethod(
      "/api/user/quests/completions",
      (status, data) => {
        if (status === 200) {
          const ctx2 = document.getElementById("questsChart").getContext("2d");
          new Chart(ctx2, {
            type: "pie",
            data: {
              labels: ["Completed", "Incomplete"],
              datasets: [
                {
                  label: "Quests",
                  data: [data.completed, data.incomplete],
                  backgroundColor: [
                    "rgba(33, 150, 243, 1)",
                    "rgba(255, 152, 0, 1)",
                  ],
                },
              ],
            },
          });
        } else {
          console.error("Error fetching quests data:", status);
        }
      },
      "GET",
      null,
      localStorage.getItem("token")
    );
  });
  