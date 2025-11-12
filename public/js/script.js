// Common JavaScript for all pages
document.addEventListener('DOMContentLoaded', () => {
  // Add fade-in animation to sections
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.classList.add('fade-in');
  });
});



//calm corner js
let isBreathing = false;

function toggleBreathing() {
  isBreathing = !isBreathing;
  var circle = document.getElementById("breathingCircle");
  var status = document.getElementById("breathingStatus");
  var text = document.getElementById("breathingText");
  var btnText = document.getElementById("btnText");

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

document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    alert('Please fill out all fields.');
    return;
  }

  alert('Login successful!');
});
