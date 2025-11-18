const quotes = [
  "Stop waiting to feel ready, Ready is not a feeling. It's decision.",
  "You are stronger than you think and braver than you feel.",
  "Breathe. It's just a bad day, not a bad life.",
  "Be proud of how far you've come, and have faith in how far you can go.",
  "One day or day one, You decide.",
  "Your future needs you, your past doesn't.",
  "Every sunrise is a reminder that you have another chance to be better.",
  "The only time you should ever look back, is to see how far you've come.",
  "One bad chapter does not define your whole story.",
  "You are doing enough.",
  "Nothing will work unless you do.",
  "Focus on improving yourself, not proving yourself."
];

// State variables
let currentIndex = 0;
let liked = false;
let saved = false;
let count = 0;
let showingSavedQuotes = false;

// DOM elements
const quoteText = document.getElementById("quotes-text");
const nextBtn = document.getElementById("next-btn");
const likeBtn = document.getElementById('like-btn');
const likeCount = document.getElementById('like-count');
const saveBtn = document.getElementById('save-btn');
const toggleSavedBtn = document.getElementById('toggle-saved-btn');
const savedQuotesContainer = document.getElementById('saved-quotes-container');

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  quoteText.textContent = quotes[currentIndex];
  loadQuoteStatus();
});

// Load quote status from backend
async function loadQuoteStatus() {
  try {
    const formData = new FormData();
    formData.append('quote_text', quotes[currentIndex]);

    const response = await fetch('../../backend/api/get_quote_status.php', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const data = await response.json();
    
    if (data.status === 'success') {
      // Update like status
      liked = data.is_liked;
      count = data.like_count;
      likeCount.textContent = count;
      
      if (liked) {
        likeBtn.classList.add('liked');
        likeBtn.querySelector('i').classList.replace('fa-regular', 'fa-solid');
      } else {
        likeBtn.classList.remove('liked');
        likeBtn.querySelector('i').classList.replace('fa-solid', 'fa-regular');
      }
      
      // Update save status
      saved = data.is_saved;
      if (saved) {
        saveBtn.classList.add('saved');
        saveBtn.querySelector('i').classList.replace('fa-regular', 'fa-solid');
      } else {
        saveBtn.classList.remove('saved');
        saveBtn.querySelector('i').classList.replace('fa-solid', 'fa-regular');
      }
    }
  } catch (error) {
    console.error('Error loading quote status:', error);
  }
}

// Next button handler
nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % quotes.length;
  quoteText.textContent = quotes[currentIndex];
  loadQuoteStatus(); // Load status for new quote
});

// Like button handler
likeBtn.addEventListener('click', async () => {
  try {
    const formData = new FormData();
    formData.append('quote_text', quotes[currentIndex]);

    const response = await fetch('../../backend/api/like_quote.php', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const data = await response.json();
    
    if (data.status === 'success') {
      liked = (data.action === 'liked');
      count = data.like_count;
      likeCount.textContent = count;
      
      if (liked) {
        likeBtn.classList.add('liked');
        likeBtn.querySelector('i').classList.replace('fa-regular', 'fa-solid');
      } else {
        likeBtn.classList.remove('liked');
        likeBtn.querySelector('i').classList.replace('fa-solid', 'fa-regular');
      }
    } else if (data.message === 'not_logged_in') {
      alert('Please login to like quotes');
      window.location.href = './login.html';
    }
  } catch (error) {
    console.error('Error liking quote:', error);
    alert('Failed to like quote. Please try again.');
  }
});

// Save button handler
saveBtn.addEventListener('click', async () => {
  try {
    const formData = new FormData();
    formData.append('quote_text', quotes[currentIndex]);

    const response = await fetch('../../backend/api/save_quote.php', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const data = await response.json();
    
    if (data.status === 'success') {
      saved = (data.action === 'saved');
      
      if (saved) {
        saveBtn.classList.add('saved');
        saveBtn.querySelector('i').classList.replace('fa-regular', 'fa-solid');
      } else {
        saveBtn.classList.remove('saved');
        saveBtn.querySelector('i').classList.replace('fa-solid', 'fa-regular');
      }

      // If saved quotes are currently shown, refresh the list
      if (showingSavedQuotes) {
        loadSavedQuotes();
      }
    } else if (data.message === 'not_logged_in') {
      alert('Please login to save quotes');
      window.location.href = './login.html';
    }
  } catch (error) {
    console.error('Error saving quote:', error);
    alert('Failed to save quote. Please try again.');
  }
});

// Toggle saved quotes visibility
toggleSavedBtn.addEventListener('click', async () => {
  showingSavedQuotes = !showingSavedQuotes;
  
  if (showingSavedQuotes) {
    toggleSavedBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Hide Saved Quotes';
    toggleSavedBtn.classList.add('active');
    savedQuotesContainer.style.display = 'block';
    await loadSavedQuotes();
  } else {
    toggleSavedBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i> Show Saved Quotes';
    toggleSavedBtn.classList.remove('active');
    savedQuotesContainer.style.display = 'none';
  }
});

// Load saved quotes from backend
async function loadSavedQuotes() {
  try {
    const response = await fetch('../../backend/api/get_saved_quotes.php', {
      method: 'GET',
      credentials: 'include'
    });

    const data = await response.json();
    
    if (data.status === 'success') {
      displaySavedQuotes(data.quotes);
    } else if (data.message === 'not_logged_in') {
      alert('Please login to view saved quotes');
      window.location.href = './login.html';
    }
  } catch (error) {
    console.error('Error loading saved quotes:', error);
    savedQuotesContainer.innerHTML = '<p style="color: #ff4d4d;">Failed to load saved quotes.</p>';
  }
}

// Display saved quotes
function displaySavedQuotes(quotesArray) {
  if (quotesArray.length === 0) {
    savedQuotesContainer.innerHTML = '<p style="color: #546d78; text-align: center; padding: 20px;">No saved quotes yet. Start saving your favorites!</p>';
    return;
  }

  let html = '<div class="saved-quotes-list">';
  quotesArray.forEach((quote, index) => {
    html += `
      <div class="saved-quote-item">
        <p class="saved-quote-text">"${quote.quote_text}"</p>
        <small class="saved-quote-date">Saved on: ${new Date(quote.saved_at).toLocaleDateString()}</small>
      </div>
    `;
  });
  html += '</div>';
  
  savedQuotesContainer.innerHTML = html;
}