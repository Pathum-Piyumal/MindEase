// mood-simple.js

// ============================================
// CONFIGURATION
// ============================================
const MOOD_CONFIG = {
  VALID_MOODS: ['happy', 'calm', 'anxious', 'sad', 'angry']
};

// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
  selectedMood: null,
  moodHistory: [],
  totalCount: 0,
  positiveCount: 0
};

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
  moodButtons: null,
  submitButton: null,
  resetButton: null,
  progressFill: null,
  progressPercent: null,
  progressStats: null,
  toast: null,
  toastMessage: null,
  showHistoryBtn: null,
  moodHistoryContainer: null,
  moodHistoryList: null
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initializeElements();
  loadMoodData();
  setupEventListeners();
  updateUI();
  addSmoothAnimations();
});

/**
 * Cache all DOM elements
 */
function initializeElements() {
  elements.moodButtons = document.querySelectorAll('.mood-button');
  elements.submitButton = document.getElementById('submitButton');
  elements.resetButton = document.getElementById('resetButton');
  elements.progressFill = document.getElementById('progressFill');
  elements.progressPercent = document.getElementById('progressPercent');
  elements.progressStats = document.getElementById('progressStats');
  elements.toast = document.getElementById('toast');
  elements.toastMessage = document.getElementById('toastMessage');
  elements.showHistoryBtn = document.getElementById('showHistoryBtn');
  elements.moodHistoryContainer = document.getElementById('moodHistoryContainer');
  elements.moodHistoryList = document.getElementById('moodHistoryList');
}

/**
 * Load mood data from backend
 */
async function loadMoodData() {
  try {
    const response = await fetch('../backend/api/mood/get_mood_stats.php');
    const data = await response.json();
    if (data.success) {
      state.totalCount = data.total_moods || 0;
      state.positiveCount = data.positive_moods || 0;
      updateUI();
    }
  } catch (error) {
    console.error('Error loading mood data:', error);
  }
}

/**
 * Load mood statistics (alias for loadMoodData)
 */
function loadMoodStats() {
  loadMoodData();
}

/**
 * Update UI elements
 */
function updateUI() {
  const percentage = state.totalCount > 0 ? Math.round((state.positiveCount / state.totalCount) * 100) : 0;
  elements.progressFill.style.width = percentage + '%';
  elements.progressPercent.textContent = percentage + '%';

  // Update progress bar color
  if (percentage >= 70) {
    elements.progressFill.style.background = 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
  } else if (percentage >= 40) {
    elements.progressFill.style.background = 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
  } else {
    elements.progressFill.style.background = 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)';
  }

  if (elements.progressStats) {
    elements.progressStats.textContent = state.totalCount === 0 ? 'No moods recorded yet. Start tracking your emotional journey! 🌱' : `You've recorded ${state.totalCount} moods, with ${state.positiveCount} positive ones.`;
  }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Mood button selection
  elements.moodButtons.forEach(button => {
    button.addEventListener('click', handleMoodSelection);

    // Add hover effect
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-8px)';
    });

    button.addEventListener('mouseleave', () => {
      if (!button.classList.contains('selected')) {
        button.style.transform = 'translateY(0)';
      }
    });
  });

  // Submit mood
  elements.submitButton.addEventListener('click', handleMoodSubmit);

  // Reset history
  if (elements.resetButton) {
    elements.resetButton.addEventListener('click', handleReset);
  }

  // Show history
  if (elements.showHistoryBtn) {
    elements.showHistoryBtn.addEventListener('click', handleShowHistory);
  }
}

/**
 * Add smooth entrance animations
 */
function addSmoothAnimations() {
  // Animate mood buttons on load
  elements.moodButtons.forEach((button, index) => {
    button.style.opacity = '0';
    button.style.transform = 'translateY(20px)';

    setTimeout(() => {
      button.style.transition = 'all 0.5s ease';
      button.style.opacity = '1';
      button.style.transform = 'translateY(0)';
    }, 100 * index);
  });
}

// ============================================
// EVENT HANDLERS
// ============================================

/**
 * Handle mood button selection
 * @param {Event} event - Click event
 */
function handleMoodSelection(event) {
  const button = event.currentTarget;
  const mood = button.getAttribute('data-mood');

  // Validate mood
  if (!MOOD_CONFIG.VALID_MOODS.includes(mood)) {
    showToast('Invalid mood selection', 'error');
    return;
  }

  // Clear previous selection
  clearMoodSelection();

  // Select new mood with animation
  button.classList.add('selected');
  button.setAttribute('aria-pressed', 'true');
  state.selectedMood = mood;

  // Add selection animation
  button.style.transform = 'translateY(-4px) scale(1.05)';

  // Enable submit button
  elements.submitButton.disabled = false;
  elements.submitButton.style.opacity = '1';
  elements.submitButton.style.transform = 'scale(1)';
}

/**
 * Clear mood selection
 */
function clearMoodSelection() {
  elements.moodButtons.forEach(button => {
    button.classList.remove('selected');
    button.setAttribute('aria-pressed', 'false');
    button.style.transform = 'translateY(0) scale(1)';
  });
  state.selectedMood = null;
  elements.submitButton.disabled = true;
  elements.submitButton.style.opacity = '0.6';
  elements.submitButton.style.transform = 'scale(0.95)';
}

/**
 * Handle mood submission
 */
async function handleMoodSubmit() {
  if (!state.selectedMood) {
    showToast('Please select a mood first!', 'error');
    return;
  }

  try {
    const response = await fetch('../backend/api/mood/save_mood.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mood: state.selectedMood })
    });

    const data = await response.json();

    if (data.success) {
      // Update local state
      state.totalCount++;
      if (state.selectedMood === 'happy' || state.selectedMood === 'calm') {
        state.positiveCount++;
      }

      // Add to history
      const now = new Date();
      state.moodHistory.push({
        mood: state.selectedMood,
        time: now.toLocaleTimeString()
      });

      updateUI();

      // Show success message
      showToast('Your ' + state.selectedMood + ' mood has been recorded!', 'success');

      // Reset selection
      clearMoodSelection();

      console.log('Total moods:', state.totalCount, 'Positive:', state.positiveCount, 'Percentage:', Math.round((state.positiveCount / state.totalCount) * 100) + '%');
    } else {
      showToast('Failed to save mood: ' + (data.message || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Error submitting mood:', error);
    showToast('Error submitting mood. Please try again.', 'error');
  }
}

/**
 * Handle reset history
 */
function handleReset() {
  if (confirm('Are you sure you want to reset your mood history? This action cannot be undone.')) {
    state.moodHistory = [];
    state.totalCount = 0;
    state.positiveCount = 0;
    updateUI();
    showToast('Mood history has been reset.', 'success');
  }
}

/**
 * Handle show history
 */
async function handleShowHistory() {
  if (elements.moodHistoryContainer.style.display === 'none') {
    try {
      const response = await fetch('../backend/api/mood/get_mood_history.php');
      const data = await response.json();
      if (data.success) {
        displayMoodHistory(data.history || []);
      } else {
        showToast('Failed to load mood history.', 'error');
      }
    } catch (error) {
      console.error('Error loading mood history:', error);
      showToast('Error loading mood history.', 'error');
    }
    elements.moodHistoryContainer.style.display = 'block';
    elements.showHistoryBtn.textContent = 'Hide History';
  } else {
    elements.moodHistoryContainer.style.display = 'none';
    elements.showHistoryBtn.textContent = 'Show History';
  }
}

/**
 * Display mood history
 * @param {Array} history - Array of mood history items
 */
function displayMoodHistory(history) {
  if (!elements.moodHistoryList) return;

  elements.moodHistoryList.innerHTML = '';

  if (history.length === 0) {
    elements.moodHistoryList.innerHTML = '<p>No mood history available.</p>';
    return;
  }

  history.forEach(item => {
    const div = document.createElement('div');
    div.className = 'mood-history-item';
    div.innerHTML = `
      <span class="mood-emoji">${getMoodEmoji(item.mood)}</span>
      <span class="mood-name">${item.mood.charAt(0).toUpperCase() + item.mood.slice(1)}</span>
      <span class="mood-time">${new Date(item.created_at).toLocaleString()}</span>
    `;
    elements.moodHistoryList.appendChild(div);
  });
}

/**
 * Get emoji for mood
 * @param {string} mood - Mood name
 * @returns {string} Emoji
 */
function getMoodEmoji(mood) {
  const emojis = {
    happy: '😊',
    calm: '😌',
    anxious: '😰',
    sad: '😢',
    angry: '😠'
  };
  return emojis[mood] || '😐';
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, etc.)
 */
function showToast(message, type = 'info') {
  if (!elements.toast || !elements.toastMessage) return;

  elements.toastMessage.textContent = message;
  elements.toast.className = 'toast ' + type + ' show';

  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 3000);
}
