// Display current date
const today = new Date();
const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
const formattedDate = today.toLocaleDateString("en-US", options);
document.getElementById("currentDate").textContent = formattedDate;

// Save Entry (Create or Update)
async function saveEntry() {
  const entryId = document.getElementById("entryId").value;
  const title = document.getElementById("entryTitle").value.trim() || "Untitled";
  const content = document.getElementById("entryText").value.trim();

  if (!content) {
    showMessage("⚠️ Please write something before saving!", "error");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);

  const saveBtn = document.getElementById("saveBtn");
  saveBtn.textContent = "Saving...";
  saveBtn.disabled = true;

  try {
    let endpoint, method;
    
    if (entryId) {
      // Update existing entry
      endpoint = "/api/journal/update_entry.php";
      formData.append("entry_id", entryId);
    } else {
      // Create new entry
      endpoint = "/api/journal/create_entry.php";
    }

    const response = await fetch(CONFIG.getApiEndpoint(endpoint), {
      method: "POST",
      credentials: "include",
      body: formData
    });

    const data = await response.json();

    if (data.status === "success") {
      showMessage(`✅ Entry ${entryId ? 'updated' : 'saved'} successfully!`, "success");
      clearForm();
      loadEntries(); // Reload the list
    } else if (data.message === "not_logged_in") {
      showMessage("⚠️ Please login to save entries!", "error");
      setTimeout(() => {
        window.location.href = "./login.html";
      }, 2000);
    } else {
      showMessage("❌ Failed to save entry: " + data.message, "error");
    }
  } catch (error) {
    console.error("Error saving entry:", error);
    showMessage("❌ Connection error. Please try again.", "error");
  } finally {
    saveBtn.textContent = "Save Entry";
    saveBtn.disabled = false;
  }
}

// Load All Entries
async function loadEntries() {
  try {
    const response = await fetch(CONFIG.getApiEndpoint("/api/journal/get_entries.php"), {
      method: "GET",
      credentials: "include"
    });

    const data = await response.json();

    if (data.status === "success") {
      displayEntries(data.entries);
      document.getElementById("entryCount").textContent = data.count;
    } else if (data.message === "not_logged_in") {
      document.getElementById("entriesList").innerHTML = 
        '<p style="text-align: center;">Please <a href="./login.html">login</a> to view your journal entries.</p>';
    } else {
      document.getElementById("entriesList").innerHTML = 
        '<p style="text-align: center; color: red;">Failed to load entries.</p>';
    }
  } catch (error) {
    console.error("Error loading entries:", error);
    document.getElementById("entriesList").innerHTML = 
      '<p style="text-align: center; color: red;">Connection error.</p>';
  }
}

// Display Entries
function displayEntries(entries) {
  const container = document.getElementById("entriesList");

  if (entries.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #999;">No entries yet. Start writing!</p>';
    return;
  }

  container.innerHTML = entries.map(entry => {
    const date = new Date(entry.created_at);
    const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    return `
      <div class="content-box entry-item" style="margin-bottom: 1.5rem; text-align: left; position: relative;">
        <div class="entry-title">
          <p style="font-weight: 600; color: #546d78; margin: 0;">
            📅 ${dateStr} at ${timeStr}
          </p>
          <div class="entry-icon" style="position: absolute; top: 1rem; right: 1rem;">
            <img src="../../assets/journal-icons/pencil-square.svg" 
                 class="pencil-icon" alt="Edit" 
                 onclick="editEntry(${entry.id}, '${escapeHtml(entry.title)}', '${escapeHtml(entry.content)}')"
                 style="cursor: pointer; width: 20px; margin-right: 10px;" />
            <img src="../../assets/journal-icons/trash.svg" 
                 class="trash-icon" alt="Delete" 
                 onclick="deleteEntry(${entry.id})"
                 style="cursor: pointer; width: 20px;" />
          </div>
        </div>
        <h3 style="margin-top: 1rem; color: #333;">${entry.title}</h3>
        <p style="margin-top: 0.5rem; color: #666; white-space: pre-wrap;">${entry.content}</p>
      </div>
    `;
  }).join("");
}

// Edit Entry
function editEntry(id, title, content) {
  document.getElementById("entryId").value = id;
  document.getElementById("entryTitle").value = title;
  document.getElementById("entryText").value = content;
  
  // Change button text
  document.getElementById("saveBtn").textContent = "Update Entry";
  document.getElementById("cancelBtn").style.display = "inline-block";
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
  
  showMessage("✏️ Editing entry. Make changes and click Update.", "info");
}

// Cancel Edit
function cancelEdit() {
  clearForm();
  showMessage("❌ Edit cancelled.", "info");
}

// Delete Entry
async function deleteEntry(id) {
  if (!confirm("Are you sure you want to delete this entry?")) {
    return;
  }

  try {
    const formData = new FormData();
    formData.append("entry_id", id);

    const response = await fetch(CONFIG.getApiEndpoint("/api/journal/delete_entry.php"), {
      method: "POST",
      credentials: "include",
      body: formData
    });

    const data = await response.json();

    if (data.status === "success") {
      showMessage("🗑️ Entry deleted successfully!", "success");
      loadEntries(); // Reload the list
    } else {
      showMessage("❌ Failed to delete entry.", "error");
    }
  } catch (error) {
    console.error("Error deleting entry:", error);
    showMessage("❌ Connection error.", "error");
  }
}

// Clear Form
function clearForm() {
  document.getElementById("entryId").value = "";
  document.getElementById("entryTitle").value = "";
  document.getElementById("entryText").value = "";
  document.getElementById("saveBtn").textContent = "Save Entry";
  document.getElementById("cancelBtn").style.display = "none";
}

// Show Message
function showMessage(message, type) {
  const container = document.getElementById("messageContainer");
  container.innerHTML = `<div class="msg-box ${type}">${message}</div>`;
  
  setTimeout(() => {
    container.innerHTML = "";
  }, 5000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "\\n");
}

// Load entries on page load
document.addEventListener("DOMContentLoaded", () => {
  loadEntries();
});