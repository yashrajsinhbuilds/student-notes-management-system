// script.js
// Frontend JavaScript for Student Notes Management System
// Handles all API calls to the backend

// ─── BACKEND URL ──────────────────────────────────────────────
// Change this if your backend runs on a different port
const API_URL = "http://localhost:5000";

// ─── LOAD NOTES ON PAGE OPEN ──────────────────────────────────
// When the page loads, automatically fetch and show all notes
window.onload = function () {
  fetchAllNotes();
};

// ─── 1. FETCH ALL NOTES (GET) ─────────────────────────────────
async function fetchAllNotes() {
  const container = document.getElementById("notesContainer");
  const countBadge = document.getElementById("notesCount");

  // Show loading text while waiting
  container.innerHTML = '<p class="loading-text">Loading notes...</p>';

  try {
    // Make GET request to backend
    const response = await fetch(`${API_URL}/notes`);
    const notes = await response.json();

    // Update the count badge
    countBadge.textContent = notes.length + " notes";

    // If no notes exist, show a friendly message
    if (notes.length === 0) {
      container.innerHTML = `
        <div class="empty-msg">
          <span>📭</span>
          No notes available. Add your first note!
        </div>
      `;
      return;
    }

    // Otherwise, build note cards and display them
    container.innerHTML = "";
    notes.forEach(function (note) {
      const card = createNoteCard(note);
      container.appendChild(card);
    });
  } catch (error) {
    // If backend is not running or there's a network error
    console.error("Error fetching notes:", error);
    container.innerHTML = `
      <div class="empty-msg">
        <span>⚠️</span>
        Could not connect to server. Make sure backend is running.
      </div>
    `;
    countBadge.textContent = "";
  }
}

// ─── 2. CREATE NOTE CARD (Helper) ────────────────────────────
function createNoteCard(note) {
  // Format the date nicely
  const dateObj = new Date(note.date);
  const formattedDate = dateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Create the card element
  const card = document.createElement("div");
  card.classList.add("note-card");

  // Fill the card with note data
  card.innerHTML = `
    <div class="note-title">${escapeHTML(note.title)}</div>
    <div class="note-description">${escapeHTML(note.description)}</div>
    <div class="note-date">📅 ${formattedDate}</div>
    <button class="delete-btn" onclick="deleteNote('${note._id}')">
      🗑 Delete
    </button>
  `;

  return card;
}

// ─── 3. ADD NOTE (POST) ───────────────────────────────────────
async function addNote() {
  const titleInput = document.getElementById("noteTitle");
  const descInput = document.getElementById("noteDesc");
  const message = document.getElementById("formMessage");
  const btn = document.getElementById("addNoteBtn");

  const title = titleInput.value.trim();
  const description = descInput.value.trim();

  // Validate inputs before sending
  if (!title || !description) {
    showMessage(message, "❗ Please fill in both Title and Description.", "error");
    return;
  }

  // Disable button during request to prevent double submit
  btn.disabled = true;
  btn.textContent = "Adding...";

  try {
    // Make POST request to backend with note data
    const response = await fetch(`${API_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Tell server we're sending JSON
      },
      body: JSON.stringify({ title, description }), // Convert to JSON string
    });

    if (response.ok) {
      // Success! Clear form and reload notes
      titleInput.value = "";
      descInput.value = "";
      showMessage(message, "✅ Note added successfully!", "success");
      fetchAllNotes(); // Refresh the list
    } else {
      const err = await response.json();
      showMessage(message, "❌ Error: " + err.message, "error");
    }
  } catch (error) {
    console.error("Error adding note:", error);
    showMessage(message, "❌ Could not connect to server.", "error");
  } finally {
    // Re-enable button after request completes
    btn.disabled = false;
    btn.textContent = "+ Add Note";
  }
}

// ─── 4. DELETE NOTE (DELETE) ─────────────────────────────────
async function deleteNote(noteId) {
  // Ask user to confirm before deleting
  const confirmed = confirm("Are you sure you want to delete this note?");
  if (!confirmed) return;

  try {
    // Make DELETE request to backend with the note's ID
    const response = await fetch(`${API_URL}/notes/${noteId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      console.log("Note deleted successfully");
      fetchAllNotes(); // Refresh the list after deletion
    } else {
      alert("Error deleting note. Please try again.");
    }
  } catch (error) {
    console.error("Error deleting note:", error);
    alert("Could not connect to server.");
  }
}

// ─── HELPER: Show form message ────────────────────────────────
function showMessage(element, text, type) {
  element.textContent = text;
  element.className = "form-message " + type;

  // Auto-hide message after 3 seconds
  setTimeout(function () {
    element.textContent = "";
    element.className = "form-message";
  }, 3000);
}

// ─── HELPER: Escape HTML to prevent XSS ──────────────────────
function escapeHTML(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
