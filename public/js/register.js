document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    let username = document.getElementById("username").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);

    let response = await fetch("../../backend/auth/register.php", {
        method: "POST",
        body: formData
    });

    let result = await response.text();

    if (result === "success") {
        alert("Registration successful! Please login.");
        window.location.href = "login.html";
    } else {
        alert("Error! Email or username may already be used.");
    }
});
