document.addEventListener("DOMContentLoaded", function () {
  const availableChallenges = document.getElementById("availableChallenges");
  const inProgressChallenges = document.getElementById("inProgressChallenges");
  const completedChallenges = document.getElementById("completedChallenges");

  const callback = (responseStatus, responseData) => {
    console.log("responseStatus:", responseStatus);
    console.log("responseData:", responseData);

    if (responseStatus !== 200) {
      availableChallenges.innerHTML =
        "<div class='col-12'><p class='text-center text-danger'>Failed to load challenges.</p></div>";
      return;
    }

    // Extract data
    const challenges = responseData[0]; // All challenges
    const userChallenges = responseData[1]; // User's progress
    const averageRatings = responseData[2]; // Ratings

    // Merge challenges with their average ratings
    challenges.forEach((challenge) => {
      const ratingData = averageRatings.find(rating => rating.challenge_id === challenge.challenge_id);
      challenge.average_rating = ratingData ? ratingData.average_rating : '0.0000';
    });

    // Map challenges to user progress
    const userChallengeMap = new Map();
    userChallenges.forEach(uc => userChallengeMap.set(uc.challenge_id, uc));

    const challengesInProgress = [];
    const challengesCompleted = [];

    userChallenges.forEach(userChallenge => {
      const challenge = challenges.find(ch => ch.challenge_id === userChallenge.challenge_id);
      if (challenge) {
        challenge.user_completed = userChallenge.user_completed;
        if (userChallenge.user_completed) {
          challengesCompleted.push(challenge);
        } else if (userChallenge.user_completed == 0) {
          challengesInProgress.push(challenge);
        }
      }
    });

    // Display ALL challenges in "Available Challenges"
    challenges.forEach((challenge) => {
      const averageRating = parseFloat(challenge.average_rating) || 0;
      const challengeCard = document.createElement("div");
      challengeCard.className = "col-xl-3 col-lg-4 col-md-6 col-sm-12 p-3";

      // Check if the challenge has at least one instance in progress
      const hasInProgress = userChallenges.some(uc => uc.challenge_id === challenge.challenge_id && uc.user_completed == 0);

      // Show "Accept Challenge" only if there is NO instance in progress
      const actionButton = hasInProgress
        ? ""
        : `<button class="btn btn-success mt-2" onclick="acceptChallenge(${challenge.challenge_id})">Accept Challenge</button>`;

      challengeCard.innerHTML = `
        <div class="card shadow">
          <div class="card-body">
            <h5 class="card-title">${challenge.challenge}</h5>
            <p class="card-text">
              Challenge ID: ${challenge.challenge_id}<br>
              Skill Points: ${challenge.skillpoints}<br>
              Average Rating: ${averageRating.toFixed(1)} / 5<br>
              Creator ID: ${challenge.creator_id}<br>
            </p>
            <a href="challengeDetails.html?challenge_id=${challenge.challenge_id}" class="btn btn-primary">View Details</a>
            ${actionButton}
          </div>
        </div>
      `;
      availableChallenges.appendChild(challengeCard);
    });

    // Display in-progress challenges ONLY if they exist in userChallenges
    challengesInProgress.forEach((challenge) => {
      createChallengeCard(challenge, inProgressChallenges, "Mark as Complete", "btn-warning", `markComplete(${challenge.challenge_id})`);
    });

    // Display completed challenges
    challengesCompleted.forEach((challenge) => {
      createChallengeCard(challenge, completedChallenges, "Add Review", "btn-secondary", `addReview(${challenge.challenge_id})`);
    });
  };

  // Fetch data from API
  fetchMethod("/api/challenges/categorised", callback, "GET", null, localStorage.getItem("token"));
});

// Helper function to create challenge cards
function createChallengeCard(challenge, container, buttonText, buttonClass, onClickAction) {
  const averageRating = parseFloat(challenge.average_rating) || 0;
  const challengeCard = document.createElement("div");
  challengeCard.className = "col-xl-3 col-lg-4 col-md-6 col-sm-12 p-3";
  challengeCard.innerHTML = `
    <div class="card shadow">
      <div class="card-body">
        <h5 class="card-title">${challenge.challenge}</h5>
        <p class="card-text">
          Challenge ID: ${challenge.challenge_id}<br>
          Skill Points: ${challenge.skillpoints}<br>
          Average Rating: ${averageRating.toFixed(1)} / 5<br>
          Creator ID: ${challenge.creator_id}<br>
        </p>
        <a href="challengeDetails.html?challenge_id=${challenge.challenge_id}" class="btn btn-primary">View Details</a>
        <button class="btn ${buttonClass} mt-2" onclick="${onClickAction}">${buttonText}</button>
      </div>
    </div>
  `;
  container.appendChild(challengeCard);
}


// Function to accept a challenge
function acceptChallenge(challenge_id) {
  // Check if the challenge_id is valid
  if (!challenge_id) {
    showToast("Invalid challenge.", "error");
    return;
  }

  // Define the callback for handling the response
  const callback = (responseStatus, responseData) => {
    console.log("responseStatus:", responseStatus);
    console.log("responseData:", responseData);

    if (responseStatus === 200) {
      window.location.reload();
    } else {
      showToast("Failed to accept the challenge: " + (responseData.error || "Unknown error"), "error");
    }
  };

  // Call fetchMethod to make the POST request
  fetchMethod(`/api/challenges/${challenge_id}`, callback, "POST", null, localStorage.getItem("token"));
}

// Function to complete a challenge
function markComplete(challenge_id) {
  // Check if the challenge_id is valid
  if (!challenge_id) {
    showToast("Invalid challenge.", "error");
    return;
  }

  // Define the callback for handling the response
  const callback = (responseStatus, responseData) => {
    console.log("responseStatus:", responseStatus);
    console.log("responseData:", responseData);

    if (responseStatus === 200) {
      // Successfully marked the challenge as complete
      window.location.reload(); // Reload the page to reflect the change
    } else {
      showToast("Failed to mark the challenge as complete: " + (responseData.error || "Unknown error"), "error");
    }
  };

  // Call fetchMethod to make the PUT request
  fetchMethod(`/api/challenges/${challenge_id}`, callback, "PUT", null, localStorage.getItem("token"));
}