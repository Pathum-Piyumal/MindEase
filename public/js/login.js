document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    let response = await fetch("../../backend/auth/login.php", {
        method: "POST",
        body: formData
    });

    let result = await response.text();

    try {
        let json = JSON.parse(result);

        if (json.status === "success") {
            localStorage.setItem("user_id", json.user_id);
            window.location.href = "mood.html"; // redirect after login
        }
    } catch (error) {
        if (result === "wrong_password") alert("Incorrect password!");
        if (result === "no_user") alert("User not found!");
    }
});
