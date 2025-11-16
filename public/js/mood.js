// mood-simple.js

document.addEventListener('DOMContentLoaded', function() {
    const moodButtons = document.querySelectorAll('.mood-button');
    const submitButton = document.getElementById('submitButton');
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    let selectedMood = null;
    let moodHistory = [];
    let positiveCount = 0;
    let totalCount = 0;

    // Set up event listeners
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
    submitButton.addEventListener('click', function() {
        if (!selectedMood) {
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