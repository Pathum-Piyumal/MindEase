    function showSidebar(){
      const sidebar = document.querySelector('.sidebar')
      sidebar.style.display = 'flex'
    }
    
    function hideSidebar(){
      const sidebar = document.querySelector('.sidebar')
      sidebar.style.display = 'none'
    }

const quotes = [
  "Stop waiting to feel ready. Ready is not a feeling. It's a decision.",
  "You are stronger than you think and braver than you feel.",
  "Breathe. It's just a bad day, not a bad life.",
  "Be proud of how far you've come, and have faith in how far you can go.",
  "One day or day one. You decide.",
  "Your future needs you, your past doesn't.",
  "Every sunrise is a reminder that you have another chance to be better.",
  "The only time you should ever look back, is to see how far you've come.",
  "One bad chapter does not define your whole story.",
  "You are doing enough.",
  "Nothing will work unless you do.",
  "Focus on improving yourself, not proving yourself."
];

let currentIndex = 0;
let currentQuote = "";

// Elements
const quoteText = document.getElementById("quotes-text");
const likeBtn = document.getElementById("like-btn");
const likeCount = document.getElementById("like-count");
const saveBtn = document.getElementById("save-btn");
const nextBtn = document.getElementById("next-btn");
const showSavedBtn = document.getElementById("show-saved-btn");
const savedContainer = document.getElementById("saved-quotes-container");
const savedList = document.getElementById("saved-quotes-list");

// Display current quote
function displayQuote() {
  currentQuote = quotes[currentIndex];
  quoteText.textContent = currentQuote;
  
  // Load quote status from backend
  loadQuoteStatus();
}

// Load quote status (liked/saved/count)
async function loadQuoteStatus() {
  try {
    const formData = new FormData();
    formData.append('quote_text', currentQuote);
    
    const response = await fetch(CONFIG.getApiEndpoint("/api/quotes/get_quote_status.php"), {
      credentials: 'include',
      method: "POST",
      body: formData
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      // Update like button
      if (data.is_liked) {
        likeBtn.classList.add('liked');
        likeBtn.querySelector('i').classList.replace('fa-regular', 'fa-solid');
      } else {
        likeBtn.classList.remove('liked');
        likeBtn.querySelector('i').classList.replace('fa-solid', 'fa-regular');
      }
      
      // Update like count
      likeCount.textContent = data.like_count;
      
      // Update save button
      if (data.is_saved) {
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

// Like button handler
likeBtn.addEventListener('click', async () => {
  try {
    const formData = new FormData();
    formData.append('quote_text', currentQuote);
    
    const response = await fetch(CONFIG.getApiEndpoint("/api/quotes/like_quote.php"), {
      method: "POST",
      credentials: 'include',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      // Update like button appearance
      if (data.action === 'liked') {
        likeBtn.classList.add('liked');
        likeBtn.querySelector('i').classList.replace('fa-regular', 'fa-solid');
      } else {
        likeBtn.classList.remove('liked');
        likeBtn.querySelector('i').classList.replace('fa-solid', 'fa-regular');
      }
      
      // Update like count immediately from response
      likeCount.textContent = data.like_count;
      
      // Animation
      likeBtn.style.transform = 'scale(1.3)';
      likeCount.style.transform = 'scale(1.3)';
      setTimeout(() => {
        likeBtn.style.transform = 'scale(1)';
        likeCount.style.transform = 'scale(1)';
      }, 200);
    } else if (data.message === 'not_logged_in') {
      alert('Please login to like quotes!');
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
    formData.append('quote_text', currentQuote);
    
    const response = await fetch(CONFIG.getApiEndpoint("/api/quotes/save_quote.php"), {
      method: "POST",
      credentials: 'include',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      if (data.action === 'saved') {
        saveBtn.classList.add('saved');
        saveBtn.querySelector('i').classList.replace('fa-regular', 'fa-solid');
        showNotification('Quote saved! ✅');
      } else {
        saveBtn.classList.remove('saved');
        saveBtn.querySelector('i').classList.replace('fa-solid', 'fa-regular');
        showNotification('Quote removed from saved 🗑️');
      }
      
      // Animation
      saveBtn.style.transform = 'scale(1.2)';
      setTimeout(() => {
        saveBtn.style.transform = 'scale(1)';
      }, 200);
    } else if (data.message === 'not_logged_in') {
      alert('Please login to save quotes!');
      window.location.href = './login.html';
    }
  } catch (error) {
    console.error('Error saving quote:', error);
    alert('Failed to save quote. Please try again.');
  }
});

// Next button handler
nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % quotes.length;
  displayQuote();
  
  // Animation
  quoteText.style.opacity = '0';
  setTimeout(() => {
    quoteText.style.opacity = '1';
  }, 100);
});

// Show saved quotes
showSavedBtn.addEventListener('click', async () => {
  if (savedContainer.style.display === 'none') {
    await loadSavedQuotes();
    savedContainer.style.display = 'block';
    showSavedBtn.textContent = 'Hide Saved Quotes';
  } else {
    savedContainer.style.display = 'none';
    showSavedBtn.textContent = 'Show Saved Quotes';
  }
});

// Load saved quotes from backend
async function loadSavedQuotes() {
  try {
    const response = await fetch(CONFIG.getApiEndpoint("/api/quotes/get_saved_quotes.php"), {
      method: "GET",
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      if (data.quotes.length === 0) {
        savedList.innerHTML = '<p style="text-align: center; color: #999;">No saved quotes yet. Start saving your favorites!</p>';
      } else {
        savedList.innerHTML = data.quotes.map((item, index) => `
          <div class="saved-quote-item" style="background: #f5f5f5; padding: 1rem; margin: 1rem 0; border-radius: 8px; border-left: 4px solid #667eea;">
            <p style="font-size: 1.1rem; color: #333; margin-bottom: 0.5rem;">"${item.quote_text}"</p>
            <small style="color: #999;">Saved on ${new Date(item.saved_at).toLocaleDateString()}</small>
          </div>
        `).join('');
      }
    } else if (data.message === 'not_logged_in') {
      savedList.innerHTML = '<p style="text-align: center;">Please <a href="./login.html">login</a> to view saved quotes.</p>';
    }
  } catch (error) {
    console.error('Error loading saved quotes:', error);
    savedList.innerHTML = '<p style="text-align: center; color: red;">Failed to load saved quotes.</p>';
  }
}

// Notification helper
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  displayQuote();
});