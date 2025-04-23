document.addEventListener("DOMContentLoaded", function () {
  const userChallengesTable = document.getElementById("user-challenges");

  // Function to update the challenges table with data from the server
  const updateUserChallenges = (challenges) => {
      userChallengesTable.innerHTML = ""; // Clear existing rows

      challenges.forEach((challenge) => {
          const row = document.createElement("tr");

          // Create and append challenge name cell
          const challengeNameCell = document.createElement("td");
          challengeNameCell.textContent = challenge.challenge_name || "Unknown Challenge";
          row.appendChild(challengeNameCell);

          // Create and append creation date cell
          const creationDateCell = document.createElement("td");
          creationDateCell.textContent = challenge.creation_date
              ? new Date(challenge.creation_date).toLocaleDateString() // Use creation_date instead of completion_date
              : "Unknown";
          row.appendChild(creationDateCell);

          // Create and append status cell (Completed or Pending)
          const statusCell = document.createElement("td");
          statusCell.textContent = challenge.completed ? "Completed" : "Pending";
          row.appendChild(statusCell);

          // Create and append notes cell (if available)
          const notesCell = document.createElement("td");
          notesCell.textContent = challenge.notes || "No notes";
          row.appendChild(notesCell);

          // Append the row to the table body
          userChallengesTable.appendChild(row);
      });
  };

  // Callback function for fetchMethod
  const handleResponse = (status, data) => {
      if (status === 200) {
          updateUserChallenges(data.challenges);
      } else {
          console.error("Failed to fetch user challenges", data);
          // Optionally, show a message in the UI
          userChallengesTable.innerHTML = "<tr><td colspan='4'>There are no challenges to load right now. Accept a challenge and start your journey to better health today!</td></tr>";
      }
  };

  // Fetch user challenges from the server
  fetchMethod("/api/user/challenges", handleResponse, "GET", null, localStorage.getItem("token"));
});
