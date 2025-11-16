let user_id = localStorage.getItem("user_id");
if (!user_id) window.location.href = "login.html";

// Submit journal entry
document.getElementById("journalForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    let title = document.getElementById("title").value;
    let content = document.getElementById("content").value;

    let formData = new FormData();
    formData.append("user_id", user_id);
    formData.append("title", title);
    formData.append("content", content);

    let response = await fetch("../../backend/journal/add_journal.php", {
        method: "POST",
        body: formData
    });

    let result = await response.text();

    if (result === "success") {
        alert("Journal saved!");
        loadJournals();
    }
});

// Load journals
async function loadJournals() {
    let response = await fetch("../../backend/journal/get_journals.php?user_id=" + user_id);
    let journals = await response.json();

    let container = document.getElementById("journalList");
    container.innerHTML = "";

    journals.forEach((j) => {
        container.innerHTML += `
            <div class="journal-item">
                <h3>${j.title}</h3>
                <p>${j.content}</p>
                <small>${j.created_at}</small>
            </div>
        `;
    });
}

loadJournals();
