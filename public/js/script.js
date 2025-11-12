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

// ===== LOGIN FORM HANDLER =====
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      alert('Please fill out all fields.');
      return;
    }

    alert('Login successful!');
  });
}
