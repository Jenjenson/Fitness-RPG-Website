document.addEventListener("DOMContentLoaded", function () {
  const loginButton = document.getElementById("loginButton");
  const registerButton = document.getElementById("registerButton");
  const profileButton = document.getElementById("profileButton");
  const logoutButton = document.getElementById("logoutButton");
  const navbarLinks = document.querySelectorAll('.navbar-nav.me-auto .nav-item'); // Targeting navbar items in me-auto

  // Check if token exists in local storage
  const token = localStorage.getItem("token");

  if (token) {
    // Token exists, show profile button, logout button, and navbar links (except login/register)
    loginButton.classList.add("d-none");
    registerButton.classList.add("d-none");
    navbarLinks.forEach(link => link.classList.remove("d-none")); // Show navbar links under me-auto
    profileButton.classList.remove("d-none");
    logoutButton.classList.remove("d-none");
  } else {
    // Token does not exist, show only login and register buttons
    loginButton.classList.remove("d-none");
    registerButton.classList.remove("d-none");
    navbarLinks.forEach(link => link.classList.add("d-none")); // Hide navbar links under me-auto
    profileButton.classList.add("d-none");
    logoutButton.classList.add("d-none");
  }

  logoutButton.addEventListener("click", function () {
    // Remove the token from local storage and redirect to index.html
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });
});
