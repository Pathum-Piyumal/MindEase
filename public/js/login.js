// Select form and inputs
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// NEW: Message display function using CSS classes
function showMessage(text, type) {
    let msgBox = document.querySelector(".msg-box");

    if (!msgBox) {
        msgBox = document.createElement("div");
        msgBox.classList.add("msg-box"); // NEW
        loginForm.prepend(msgBox);      // NEW
    }

    msgBox.textContent = text;

    // NEW: Remove old classes
    msgBox.classList.remove("error", "success");

    // NEW: Add new (error/success)
    msgBox.classList.add(type);
}

// NEW: Form validation logic
loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (email === "" || password === "") {
        showMessage("Please enter both email and password.", "error");
        return;
    }

     const demoEmail = "test@example.com";
    const demoPassword = "123456";

    if (email === demoEmail && password === demoPassword) {
        showMessage("Login successful! Redirecting...", "success");

        setTimeout(() => {
            window.location.href = "../index.html"; // NEW: Redirect
        }, 1500);
    } else {
        showMessage("Incorrect email or password. Please try again.", "error");
    }
});