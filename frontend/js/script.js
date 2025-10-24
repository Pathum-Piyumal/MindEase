// Common JavaScript for all pages
document.addEventListener('DOMContentLoaded', () => {
  // Add fade-in animation to sections
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.classList.add('fade-in');
  });
});