
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

    // Submit button handler
    submitButton.addEventListener('click', async function() {
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

            const response = await fetch(CONFIG.getApiEndpoint('/api/mood/save_mood.php'), {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await response.json();

            if (data.status === 'success') {
                showToast(`Your ${selectedMood} mood has been recorded!`, 'success');
                
                // Reset selection
                moodButtons.forEach(function(btn) {
                    btn.classList.remove('selected');
                });
                selectedMood = null;
                
                // Reload statistics
                loadMoodStats();
            } else if (data.message === 'not_logged_in') {
                showToast('Please login to track your mood!', 'error');
                setTimeout(() => {
                    window.location.href = './login.html';
                }, 2000);
            } else {
                showToast('Failed to save mood: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Error saving mood:', error);
            showToast('Connection error. Please try again.', 'error');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = true;
        }
    });

    // Load mood statistics
    async function loadMoodStats() {
        try {
            const response = await fetch(CONFIG.getApiEndpoint('/api/mood/get_mood_stats.php'), {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.status === 'success') {
                // Update progress bar
                const percentage = data.positive_percentage;
                progressFill.style.width = percentage + '%';
                progressPercent.textContent = percentage + '%';

                // Update progress bar color based on percentage
                if (percentage >= 70) {
                    progressFill.style.background = 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
                } else if (percentage >= 40) {
                    progressFill.style.background = 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
                } else {
                    progressFill.style.background = 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)';
                }

                console.log('Mood stats loaded:', data);
            } else if (data.message === 'not_logged_in') {
                // User not logged in - show default state
                progressFill.style.width = '0%';
                progressPercent.textContent = '0%';
            }
        } catch (error) {
            console.error('Error loading mood stats:', error);
        }
    }

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
// Mood History Feature
document.getElementById('showHistoryBtn').addEventListener('click', async function() {
    const container = document.getElementById('moodHistoryContainer');
    const btn = this;
    
    if (container.style.display === 'none') {
        // Load and show history
        btn.textContent = 'Loading...';
        btn.disabled = true;
        
        try {
            const response = await fetch(CONFIG.getApiEndpoint('/api/mood/get_mood_history.php'), {
                method: 'GET',
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                displayMoodHistory(data.entries);
                container.style.display = 'block';
                btn.textContent = 'Hide History';
            } else if (data.message === 'not_logged_in') {
                showToast('Please login to view mood history!', 'error');
            }
        } catch (error) {
            console.error('Error loading history:', error);
            showToast('Failed to load history', 'error');
        } finally {
            btn.disabled = false;
        }
    } else {
        // Hide history
        container.style.display = 'none';
        btn.textContent = 'Show History';
    }
});

// Display mood history
function displayMoodHistory(entries) {
    const container = document.getElementById('moodHistoryList');
    
    if (entries.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No mood history yet. Start tracking today!</p>';
        return;
    }
    
    const moodEmojis = {
        'happy': '😊',
        'calm': '💕',
        'anxious': '😰',
        'sad': '😢',
        'angry': '😠'
    };
    
    container.innerHTML = entries.map(entry => {
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
            <div style="display: flex; align-items: center; padding: 1rem; margin: 0.5rem 0; background: #f5f5f5; border-radius: 8px;">
                <span style="font-size: 2rem; margin-right: 1rem;">${moodEmojis[entry.mood]}</span>
                <div style="flex: 1;">
                    <strong>${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}</strong>
                    <br>
                    <small style="color: #666;">${dateStr} at ${timeStr}</small>
                    ${entry.notes ? `<br><small style="color: #999;">${entry.notes}</small>` : ''}
                </div>
            </div>
        `;
    }).join('');
}