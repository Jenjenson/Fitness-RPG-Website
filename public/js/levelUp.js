document.addEventListener("DOMContentLoaded", () => {
    const levelUpButton = document.getElementById("levelUpButton");

    const levelUpCallback = (responseStatus, responseData) => {
        if (responseStatus === 200) {
            showToast("Level up successful!", "success");
            setTimeout(() => window.location.reload(), 1000); // Give time for the toast to be seen
        } else {
            showToast(responseData.error || "Failed to level up. Please try again.", "error");
        }
    };
    

    levelUpButton.addEventListener("click", () => {
        fetchMethod(
            "/api/user/level",
            levelUpCallback,
            "PUT",
            null,
            localStorage.getItem("token") // Ensure token exists in localStorage
        );
    });
});
