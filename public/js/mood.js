// mood-simple.js

document.addEventListener('DOMContentLoaded', function() {
    const moodButtons = document.querySelectorAll('.mood-button');
    const submitButton = document.getElementById('submitButton');
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    let selectedMood = null;

    // Load mood statistics on page load
    loadMoodStats();

    // Set up mood button event listeners
    moodButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Remove selected class from all buttons
            moodButtons.forEach(function(btn) {
                btn.classList.remove('selected');
            });

            // Add selected class to clicked button
            this.classList.add('selected');
            selectedMood = this.getAttribute('data-mood');
            submitButton.disabled = false;
        });
    });

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

        // Add to history
        const now = new Date();
        moodHistory.push({
            mood: selectedMood,
            time: now.toLocaleTimeString()
        });

        // Update counts
        totalCount++;
        if (selectedMood === 'happy' || selectedMood === 'calm') {
            positiveCount++;
        }

        // Calculate percentage
        const percentage = Math.round((positiveCount / totalCount) * 100);
        
        // Update progress bar
        progressFill.style.width = percentage + '%';
        progressPercent.textContent = percentage + '%';

        // Update progress bar color
        if (percentage >= 70) {
            progressFill.style.background = 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
        } else if (percentage >= 40) {
            progressFill.style.background = 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
        } else {
            progressFill.style.background = 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)';
        }

        // Show success message
        showToast('Your ' + selectedMood + ' mood has been recorded!', 'success');

        // Reset selection
        moodButtons.forEach(function(btn) {
            btn.classList.remove('selected');
        });
        selectedMood = null;
        submitButton.disabled = true;

        console.log('Total moods:', totalCount, 'Positive:', positiveCount, 'Percentage:', percentage + '%');
    });

    // Toast notification function
    function showToast(message, type) {
        toastMessage.textContent = message;
        toast.className = 'toast ' + type + ' show';
        
        setTimeout(function() {
            toast.classList.remove('show');
        }, 3000);
    }

    // Initialize submit button as disabled
    submitButton.disabled = true;
});