document.addEventListener("DOMContentLoaded", function () {
    let selectedRating = 0;
  
    // Handle hover effect on stars
    document.querySelectorAll("#ratingStars .star").forEach((star) => {
      star.addEventListener("mouseenter", function () {
        const hoverValue = parseInt(this.getAttribute("data-value"));
        document.querySelectorAll("#ratingStars .star").forEach((s) => {
          const value = parseInt(s.getAttribute("data-value"));
          s.classList.toggle("hovered", value <= hoverValue);
        });
      });
  
      star.addEventListener("mouseleave", function () {
        document.querySelectorAll("#ratingStars .star").forEach((s) => {
          s.classList.remove("hovered");
        });
      });
  
      star.addEventListener("click", function () {
        selectedRating = parseInt(this.getAttribute("data-value"));
        document.querySelectorAll("#ratingStars .star").forEach((s) => {
          const value = parseInt(s.getAttribute("data-value"));
          s.classList.toggle("selected", value <= selectedRating);
        });
      });
    });
  
    // Handle review submission
    document.getElementById("submitReview").addEventListener("click", function () {
      const notes = document.getElementById("reviewNotes").value.trim();
  
      if (selectedRating === 0 || notes === "") {
        showToast("Please select a rating and provide review notes.", "error");
        return;
      }
  
      const reviewData = {
        rating: selectedRating,
        notes: notes,
      };
  
      const challenge_id = this.getAttribute("data-challenge-id"); // Store challenge ID dynamically
  
      fetchMethod(`/api/challenges/${challenge_id}/review`, (responseStatus, responseData) => {
        console.log("responseStatus:", responseStatus);
        console.log("responseData:", responseData);
  
        if (responseStatus === 200) {
          showToast("Review added successfully!", "success");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          showToast("Failed to add review: " + (responseData.error || "Unknown error"), "error");
        }
      }, "PUT", reviewData, localStorage.getItem("token"));
  
      const bootstrapModal = bootstrap.Modal.getInstance(document.getElementById("addReviewModal"));
      bootstrapModal.hide();
    });
  });
  
  // Function to open the modal and set challenge ID
  function addReview(challenge_id) {
    document.getElementById("submitReview").setAttribute("data-challenge-id", challenge_id);
    const bootstrapModal = new bootstrap.Modal(document.getElementById("addReviewModal"));
    bootstrapModal.show();
  }
  