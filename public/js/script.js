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

function toggleBreathing() {
  isBreathing = !isBreathing;
  const circle = document.getElementById("breathingCircle");
  const status = document.getElementById("breathingStatus");
  const text = document.getElementById("breathingText");
  const btnText = document.getElementById("btnText");

  if (isBreathing) {
    circle.classList.add("active");
    status.textContent = "Breathe...";
    text.textContent = "Follow the circle. Inhale as it grows, exhale as it shrinks.";
    btnText.textContent = "Pause";
  } else {
    circle.classList.remove("active");
    status.textContent = "Ready";
    text.textContent = "Click start to begin a guided breathing exercise";
    btnText.textContent = "Start";
  }
}
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