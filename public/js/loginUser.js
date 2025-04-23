document.addEventListener("DOMContentLoaded", function () {
    const callback = (responseStatus, responseData) => {
      console.log("responseStatus:", responseStatus);
      console.log("responseData:", responseData);
      if (responseStatus == 200) {
        // Check if login was successful
        if (responseData.token) {
          // Store the token in local storage
          localStorage.setItem("token", responseData.token);
          // Redirect or perform further actions for logged-in user
          window.location.href = "profile.html";
        }
      } else {
        warningCard.classList.remove("d-none");
        warningText.innerText = responseData.message;
      }
    };
  
    const loginForm = document.getElementById("loginForm");
  
    const warningCard = document.getElementById("warningCard");
    const warningText = document.getElementById("warningText");
  
    loginForm.addEventListener("submit", function (event) {
      console.log("loginForm.addEventListener");
      event.preventDefault();
  
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
  
      const data = {
        username: username,
        password: password,
      };
      // Perform login request
      fetchMethod(currentUrl + "/api/login", callback, "POST", data);
  
      // Reset the form fields
      loginForm.reset();
    });
  });