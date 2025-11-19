// API Base URL
const API_BASE = CONFIG.apiUrl + '/api/quotes';
// DOM Elements
const moodButtons = document.querySelectorAll('.mood-button');
const submitButton = document.getElementById('submitButton');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');
const progressStats = document.getElementById('progressStats');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const showHistoryBtn = document.getElementById('showHistoryBtn');
const moodHistoryContainer = document.getElementById('moodHistoryContainer');
const moodHistoryList = document.getElementById('moodHistoryList');

let selectedMood = null;

// INITIALIZATION

document.addEventListener('DOMContentLoaded', function() {
    loadMoodStats();
    setupEventListeners();
    addSmoothAnimations();
});


// SETUP EVENT LISTENERS

function setupEventListeners() {
    // Mood button selection
    moodButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Clear previous selection
            moodButtons.forEach(function(btn) {
                btn.classList.remove('selected');
                btn.setAttribute('aria-pressed', 'false');
                btn.style.transform = 'translateY(0)';
            });

            // Select new mood
            this.classList.add('selected');
            this.setAttribute('aria-pressed', 'true');
            this.style.transform = 'translateY(-4px) scale(1.05)';
            
            selectedMood = this.getAttribute('data-mood');
            submitButton.disabled = false;
        });

        // Hover effects
        button.addEventListener('mouseenter', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'translateY(-8px)';
            }
        });

        button.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'translateY(0)';
            }
        });
    });

    // Submit mood
    submitButton.addEventListener('click', handleMoodSubmit);

    // Show history
    if (showHistoryBtn) {
        showHistoryBtn.addEventListener('click', handleShowHistory);
    }
}


// LOAD MOOD STATISTICS
async function loadMoodStats() {
    try {
        const response = await fetch(API_BASE + '/api/mood/get_mood_stats.php', {
            method: 'GET',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.status === 'success') {
            const percentage = data.positive_percentage;
            const totalEntries = data.total_entries;
            
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

            // Update stats text
            if (progressStats) {
                if (totalEntries === 0) {
                    progressStats.textContent = 'No moods recorded yet. Start tracking your emotional journey! 🌱';
                } else {
                    const positiveCount = Math.round((percentage / 100) * totalEntries);
                    progressStats.textContent = `You've recorded ${totalEntries} moods, with ${positiveCount} positive ones.`;
                }
            }
        }
    } catch (error) {
        console.error('Error loading mood stats:', error);
    }
}


// SUBMIT MOOD

async function handleMoodSubmit() {
    if (!selectedMood) {
        showToast('Please select a mood first!', 'error');
        return;
    }

    const originalText = submitButton.textContent;
    submitButton.textContent = 'Saving...';
    submitButton.disabled = true;

    try {
        const formData = new FormData();
        formData.append('mood', selectedMood);

        const response = await fetch(API_BASE + '/api/mood/save_mood.php', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const data = await response.json();

        if (data.status === 'success') {
            showToast(`✅ Your ${selectedMood} mood has been recorded!`, 'success');
            
            // Clear selection
            moodButtons.forEach(function(btn) {
                btn.classList.remove('selected');
                btn.setAttribute('aria-pressed', 'false');
                btn.style.transform = 'translateY(0)';
            });
            selectedMood = null;
            
            // Reload statistics
            await loadMoodStats();
            
        } else if (data.message === 'not_logged_in') {
            showToast('⚠️ Please login to track your mood!', 'error');
            setTimeout(() => {
                window.location.href = './login.html';
            }, 2000);
        } else {
            showToast('❌ Failed to save mood: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error submitting mood:', error);
        showToast('❌ Connection error. Please try again.', 'error');
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = true;
    }
}


// SHOW MOOD HISTORY

async function handleShowHistory() {
    if (moodHistoryContainer.style.display === 'none') {
        showHistoryBtn.textContent = 'Loading...';
        showHistoryBtn.disabled = true;
        
        try {
            const response = await fetch(API_BASE + '/api/mood/get_mood_history.php', {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.status === 'success') {
                displayMoodHistory(data.entries);
                moodHistoryContainer.style.display = 'block';
                showHistoryBtn.textContent = 'Hide History';
            } else if (data.message === 'not_logged_in') {
                showToast('⚠️ Please login to view mood history!', 'error');
            } else {
                showToast('❌ Failed to load history', 'error');
            }
        } catch (error) {
            console.error('Error loading history:', error);
            showToast('❌ Connection error', 'error');
        } finally {
            showHistoryBtn.disabled = false;
        }
    } else {
        moodHistoryContainer.style.display = 'none';
        showHistoryBtn.textContent = 'Show History';
    }
}


// DISPLAY MOOD HISTORY

function displayMoodHistory(entries) {
    if (!moodHistoryList) return;

    if (entries.length === 0) {
        moodHistoryList.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No mood history yet. Start tracking today!</p>';
        return;
    }

    const moodEmojis = {
        'happy': '😊',
        'calm': '😌',
        'anxious': '😰',
        'sad': '😢',
        'angry': '😠'
    };

    const moodColors = {
        'happy': '#fbbf24',
        'calm': '#34d399',
        'anxious': '#f87171',
        'sad': '#60a5fa',
        'angry': '#fb923c'
    };

    moodHistoryList.innerHTML = entries.map(entry => {
        const date = new Date(entry.created_at);
        const dateStr = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        const timeStr = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        return `
            <div class="mood-history-item" style="display: flex; align-items: center; padding: 1rem; margin: 0.5rem 0; background: #f8f9fa; border-radius: 12px; border-left: 4px solid ${moodColors[entry.mood]}; animation: fadeIn 0.5s ease;">
                <span style="font-size: 2.5rem; margin-right: 1rem;">${moodEmojis[entry.mood]}</span>
                <div style="flex: 1;">
                    <strong style="color: #333; text-transform: capitalize;">${entry.mood}</strong>
                    <br>
                    <small style="color: #666;">${dateStr} at ${timeStr}</small>
                    ${entry.notes ? `<br><small style="color: #999; font-style: italic;">${entry.notes}</small>` : ''}
                </div>
            </div>
        `;
    }).join('');
}


// SMOOTH ANIMATIONS

function addSmoothAnimations() {
    moodButtons.forEach((button, index) => {
        button.style.opacity = '0';
        button.style.transform = 'translateY(20px)';

        setTimeout(() => {
            button.style.transition = 'all 0.5s ease';
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }, 100 * index);
    });
}


// TOAST NOTIFICATION

function showToast(message, type = 'info') {
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.className = 'toast ' + type + ' show';

    setTimeout(function() {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize submit button as disabled
submitButton.disabled = true;