function showSidebar(){
  const sidebar = document.querySelector('.sidebar')
  sidebar.style.display = 'flex'
}

function hideSidebar(){
  const sidebar = document.querySelector('.sidebar')
  sidebar.style.display = 'none'
}

// Common JavaScript for all pages
document.addEventListener('DOMContentLoaded', () => {
  // Add fade-in animation to sections
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.classList.add('fade-in');
  });
});

// Calm corner JS
let isBreathing = false;
let sessionStartTime = 0;
let sessionTimerInterval = null;
let breathCount = 0;
let currentPattern = 'standard';
let inhaleDuration = 4;
let holdDuration = 4;
let exhaleDuration = 4;

// Breathing patterns
const patterns = {
  standard: { inhale: 4, hold: 4, exhale: 4 },
  '4-7-8': { inhale: 4, hold: 7, exhale: 8 },
  box: { inhale: 4, hold: 4, exhale: 4 }
};

// Audio context for chimes
let audioContext = null;

function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playChime(frequency = 440, duration = 0.2) {
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = 'sine';
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

function updatePattern() {
  const select = document.getElementById('patternSelect');
  currentPattern = select.value;
  const pattern = patterns[currentPattern];
  inhaleDuration = pattern.inhale;
  holdDuration = pattern.hold;
  exhaleDuration = pattern.exhale;
  updateSliders();
}

function updateDurations() {
  inhaleDuration = parseInt(document.getElementById('inhaleSlider').value);
  holdDuration = parseInt(document.getElementById('holdSlider').value);
  exhaleDuration = parseInt(document.getElementById('exhaleSlider').value);
  document.getElementById('inhaleValue').textContent = inhaleDuration;
  document.getElementById('holdValue').textContent = holdDuration;
  document.getElementById('exhaleValue').textContent = exhaleDuration;
}

function updateSliders() {
  document.getElementById('inhaleSlider').value = inhaleDuration;
  document.getElementById('holdSlider').value = holdDuration;
  document.getElementById('exhaleSlider').value = exhaleDuration;
  updateDurations();
}

function startSessionTimer() {
  sessionStartTime = Date.now();
  sessionTimerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    document.getElementById('sessionTimer').textContent = `${minutes}:${seconds}`;
  }, 1000);
}

function stopSessionTimer() {
  if (sessionTimerInterval) {
    clearInterval(sessionTimerInterval);
    sessionTimerInterval = null;
  }
}

function saveSession() {
  const sessions = JSON.parse(localStorage.getItem('breathingSessions') || '[]');
  sessions.push({ date: new Date().toISOString(), duration: Math.floor((Date.now() - sessionStartTime) / 1000), breaths: breathCount });
  localStorage.setItem('breathingSessions', JSON.stringify(sessions));
  updateWeeklySessions();
}

function updateWeeklySessions() {
  const sessions = JSON.parse(localStorage.getItem('breathingSessions') || '[]');
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyCount = sessions.filter(s => new Date(s.date) > oneWeekAgo).length;
  document.getElementById('weeklySessions').textContent = weeklyCount;
}

function toggleBreathing() {
  isBreathing = !isBreathing;
  const circle = document.getElementById("breathingCircle");
  const status = document.getElementById("breathingStatus");
  const text = document.getElementById("breathingText");
  const btnText = document.getElementById("btnText");

  if (isBreathing) {
    initAudio();
    startSessionTimer();
    circle.classList.add("active");
    status.textContent = "Inhale";
    text.textContent = "Follow the circle. Inhale as it grows, exhale as it shrinks.";
    btnText.textContent = "Pause";
    startBreathingCycle();
  } else {
    stopSessionTimer();
    saveSession();
    circle.classList.remove("active", "inhale", "exhale");
    status.textContent = "Ready";
    text.textContent = "Click start to begin a guided breathing exercise";
    btnText.textContent = "Start";
    breathCount = 0;
    document.getElementById('breathCounter').textContent = breathCount;
  }
}

function startBreathingCycle() {
  if (!isBreathing) return;

  const circle = document.getElementById("breathingCircle");
  const status = document.getElementById("breathingStatus");

  // Inhale
  circle.classList.add("inhale");
  circle.classList.remove("exhale");
  status.textContent = "Inhale";
  playChime(440, 0.2); // A note
  if (navigator.vibrate) navigator.vibrate(100);

  setTimeout(() => {
    if (!isBreathing) return;

    // Hold
    status.textContent = "Hold";
    setTimeout(() => {
      if (!isBreathing) return;

      // Exhale
      circle.classList.add("exhale");
      circle.classList.remove("inhale");
      status.textContent = "Exhale";
      playChime(330, 0.2); // E note
      if (navigator.vibrate) navigator.vibrate(100);

      setTimeout(() => {
        if (!isBreathing) return;
        breathCount++;
        document.getElementById('breathCounter').textContent = breathCount;
        startBreathingCycle(); // Repeat cycle
      }, exhaleDuration * 1000);
    }, holdDuration * 1000);
  }, inhaleDuration * 1000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  updatePattern();
  updateWeeklySessions();
});
async function loadMeditationAudio() {
    const response = await fetch('../../backend/api/meditations.php');
    const data = await response.json();

    const container = document.getElementById("meditation-list");

    data.forEach(item => {
        container.innerHTML += `
            <div class="meditation-card">
                <h4>${item.title}</h4>
                <p>Duration: ${item.duration}</p>
                <audio controls>
                    <source src="${item.url}" type="audio/mpeg">
                </audio>
            </div>
        `;
    });
}

loadMeditationAudio();


// ===== SCROLL ANIMATIONS =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.fade-in, .section-hero, .core-features, .feature-hero, .ready-to-feel')
  .forEach((el) => observer.observe(el));

// ===== STAT COUNTER ANIMATION =====
const statItems = document.querySelectorAll('.stat-item h2');

const animateStats = (el) => {
  const target = parseInt(el.textContent);
  let count = 0;
  const speed = target / 50;
  const update = () => {
    count += speed;
    if (count < target) {
      el.textContent = Math.floor(count) + (el.textContent.includes('%') ? '%' : '+');
      requestAnimationFrame(update);
    } else {
      el.textContent = el.textContent; // final value
    }
  };
  update();
};

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateStats(entry.target.querySelector('h2'));
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item').forEach(stat => statObserver.observe(stat));


// --- FAQ Accordion Logic ---

document.addEventListener('DOMContentLoaded', () => {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            // Get the corresponding answer
            const answer = question.nextElementSibling;

            // Toggle the 'active' class on the question button
            question.classList.toggle('active');

            // Toggle the 'open' class on the answer element
            // This is what controls the max-height/padding for the transition effect
            answer.classList.toggle('open');
        });
    });
});

// --- Dark Mode Toggle ---

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }

    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
});

// --- Swiper Initialization for Testimonials ---

document.addEventListener('DOMContentLoaded', () => {
    const testimonialSwiper = new Swiper('.testimonial-swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            768: {
                slidesPerView: 2,
            },
            1024: {
                slidesPerView: 3,
            },
        },
    });
});
