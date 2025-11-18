/**
 * Mood Tracker Application
 * Manages mood selection, tracking, and data persistence
 */

// ============================================
// CONSTANTS
// ============================================
const MOOD_CONFIG = {
  POSITIVE_MOODS: ['happy', 'calm'],
  VALID_MOODS: ['happy', 'calm', 'anxious', 'sad', 'angry'],
  STORAGE_KEY: 'mindease_mood_history',
  TOAST_DURATION: 3000
};

const PROGRESS_COLORS = {
  HIGH: 'linear-gradient(90deg, #A8E6CF, #82D4BB)',
  MEDIUM: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
  LOW: 'linear-gradient(90deg, #f87171, #ef4444)'
};

// ============================================
// STATE
// ============================================
const state = {
  selectedMood: null,
  moodHistory: [],
  positiveCount: 0,
  totalCount: 0
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
  toastMessage: null
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
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Mood button selection
  elements.moodButtons.forEach(button => {
    button.addEventListener('click', handleMoodSelection);
    
    // Add hover sound effect (optional)
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
 * Handle mood submission
 */
function handleMoodSubmit() {
  if (!state.selectedMood) {
    showToast('Please select a mood first!', 'error');
    return;
  }

  try {
    // Record mood
    recordMood(state.selectedMood);

    // Save to storage
    saveMoodData();

    // Update UI with animation
    updateUI();

    // Show success message with emoji
    const moodEmoji = getMoodEmoji(state.selectedMood);
    const moodName = state.selectedMood.charAt(0).toUpperCase() + state.selectedMood.slice(1);
    showToast(`${moodEmoji} Your ${moodName} mood has been recorded!`, 'success');

    // Reset selection with smooth transition
    setTimeout(() => {
      clearMoodSelection();
      state.selectedMood = null;
      elements.submitButton.disabled = true;
      elements.submitButton.style.opacity = '0.5';
    }, 300);

  } catch (error) {
    console.error('Error submitting mood:', error);
    showToast('Failed to save your mood. Please try again.', 'error');
  }
}

/**
 * Handle reset button click
 */
function handleReset() {
  if (state.totalCount === 0) {
    showToast('No mood history to reset', 'error');
    return;
  }

  const confirmed = confirm('Are you sure you want to reset your mood history? This cannot be undone.');
  
  if (confirmed) {
    resetMoodData();
    updateUI();
    showToast('✨ Mood history has been reset', 'success');
  }
}

// ============================================
// MOOD LOGIC
// ============================================

/**
 * Record a new mood entry
 * @param {string} mood - The mood to record
 */
function recordMood(mood) {
  const now = new Date();
  const entry = {
    mood: mood,
    timestamp: now.toISOString(),
    date: now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    time: now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  };

  state.moodHistory.push(entry);
  state.totalCount++;

  if (MOOD_CONFIG.POSITIVE_MOODS.includes(mood)) {
    state.positiveCount++;
  }
}

/**
 * Calculate positive mood percentage
 * @returns {number} Percentage of positive moods
 */
function calculatePercentage() {
  if (state.totalCount === 0) return 0;
  return Math.round((state.positiveCount / state.totalCount) * 100);
}

/**
 * Get emoji for a given mood
 * @param {string} mood - Mood type
 * @returns {string} Emoji character
 */
function getMoodEmoji(mood) {
  const emojis = {
    happy: '😊',
    calm: '😌',
    anxious: '😰',
    sad: '😢',
    angry: '😠'
  };
  return emojis[mood] || '😊';
}

/**
 * Clear all mood button selections
 */
function clearMoodSelection() {
  elements.moodButtons.forEach(button => {
    button.classList.remove('selected');
    button.setAttribute('aria-pressed', 'false');
    button.style.transform = 'translateY(0)';
  });
}

// ============================================
// UI UPDATES
// ============================================

/**
 * Update all UI elements
 */
function updateUI() {
  updateProgressBar();
  updateProgressStats();
}

/**
 * Update progress bar display with smooth animation
 */
function updateProgressBar() {
  const percentage = calculatePercentage();

  // Update width with smooth transition
  elements.progressFill.style.transition = 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease';
  elements.progressFill.style.width = `${percentage}%`;
  elements.progressPercent.textContent = `${percentage}%`;

  // Update ARIA attribute
  const progressBar = elements.progressFill.parentElement;
  progressBar.setAttribute('aria-valuenow', percentage);

  // Update color based on percentage with matching gradient style
  let color = PROGRESS_COLORS.LOW;
  if (percentage >= 70) {
    color = PROGRESS_COLORS.HIGH;
  } else if (percentage >= 40) {
    color = PROGRESS_COLORS.MEDIUM;
  }

  elements.progressFill.style.background = color;
}

/**
 * Update progress statistics text
 */
function updateProgressStats() {
  if (state.totalCount === 0) {
    elements.progressStats.textContent = 'No moods recorded yet. Start tracking your emotional journey! 🌱';
    return;
  }

  const percentage = calculatePercentage();
  const negative = state.totalCount - state.positiveCount;

  elements.progressStats.textContent = 
    `${state.totalCount} total mood${state.totalCount !== 1 ? 's' : ''} recorded · ` +
    `${state.positiveCount} positive · ${negative} negative · ${percentage}% positive rate`;
}

// ============================================
// DATA PERSISTENCE
// ============================================

/**
 * Load mood data from localStorage
 */
function loadMoodData() {
  try {
    const saved = localStorage.getItem(MOOD_CONFIG.STORAGE_KEY);
    
    if (saved) {
      const data = JSON.parse(saved);
      state.moodHistory = data.moodHistory || [];
      
      // Recalculate counts from history
      recalculateStats();
    }
  } catch (error) {
    console.error('Error loading mood data:', error);
    showToast('Failed to load saved mood data', 'error');
  }
}

/**
 * Save mood data to localStorage
 */
function saveMoodData() {
  try {
    const data = {
      moodHistory: state.moodHistory,
      lastUpdated: new Date().toISOString(),
      stats: {
        totalCount: state.totalCount,
        positiveCount: state.positiveCount,
        percentage: calculatePercentage()
      }
    };
    
    localStorage.setItem(MOOD_CONFIG.STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving mood data:', error);
    throw new Error('Failed to save mood data');
  }
}

/**
 * Reset all mood data
 */
function resetMoodData() {
  state.moodHistory = [];
  state.positiveCount = 0;
  state.totalCount = 0;
  
  try {
    localStorage.removeItem(MOOD_CONFIG.STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting mood data:', error);
  }
}

/**
 * Recalculate statistics from mood history
 */
function recalculateStats() {
  state.totalCount = state.moodHistory.length;
  state.positiveCount = state.moodHistory.filter(entry => 
    MOOD_CONFIG.POSITIVE_MOODS.includes(entry.mood)
  ).length;
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

/**
 * Show toast notification with smooth animation
 * @param {string} message - Message to display
 * @param {string} type - Toast type ('success' or 'error')
 */
function showToast(message, type = 'success') {
  // Set message and type
  elements.toastMessage.textContent = message;
  elements.toast.className = `toast ${type}`;
  
  // Show with smooth animation
  setTimeout(() => {
    elements.toast.classList.add('show');
  }, 10);

  // Auto-hide after duration
  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, MOOD_CONFIG.TOAST_DURATION);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get mood statistics for a date range
 * @param {number} days - Number of days to look back
 * @returns {Object} Statistics object
 */
function getMoodStats(days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentMoods = state.moodHistory.filter(entry => 
    new Date(entry.timestamp) >= cutoffDate
  );

  const moodCounts = {};
  recentMoods.forEach(entry => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  });

  return {
    total: recentMoods.length,
    moodCounts,
    mostCommon: Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b, 'none'
    ),
    positivePercentage: recentMoods.length > 0 
      ? Math.round((recentMoods.filter(e => MOOD_CONFIG.POSITIVE_MOODS.includes(e.mood)).length / recentMoods.length) * 100)
      : 0
  };
}

/**
 * Export mood data as JSON
 * @returns {string} JSON string of mood history
 */
function exportMoodData() {
  return JSON.stringify({
    exported: new Date().toISOString(),
    totalMoods: state.totalCount,
    positivePercentage: calculatePercentage(),
    history: state.moodHistory
  }, null, 2);
}

/**
 * Get weekly mood summary
 * @returns {Object} Weekly summary
 */
function getWeeklySummary() {
  const stats = getMoodStats(7);
  return {
    weeklyTotal: stats.total,
    mostCommonMood: stats.mostCommon,
    positiveRate: stats.positivePercentage,
    moodDistribution: stats.moodCounts
  };
}

// ============================================
// CONSOLE HELPER (for debugging)
// ============================================
console.log('🧠 MindEase Mood Tracker Loaded Successfully');
console.log('💡 Tip: Use exportMoodData() to export your mood history');

// Export functions for testing or external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getMoodStats,
    exportMoodData,
    calculatePercentage,
    getWeeklySummary
  };
}