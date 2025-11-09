
const likeBtn = document.getElementById('like-btn');
const likeCount = document.getElementById('like-count');

let liked = false;
let count = 0;

likeBtn.addEventListener('click', () => {
  liked = !liked;
  if (liked) {
    likeBtn.classList.add('liked');
    likeBtn.querySelector('i').classList.replace('fa-regular', 'fa-solid');
    count++;
  } else {
    likeBtn.classList.remove('liked');
    likeBtn.querySelector('i').classList.replace('fa-solid', 'fa-regular');
    count--;
  }
  likeCount.textContent = count;
});


const saveBtn = document.getElementById('save-btn');

let saved = false;


saveBtn.addEventListener('click', () => {
  saved = !saved;
  if (saved) {
    saveBtn.classList.add('saved');
    saveBtn.querySelector('i').classList.replace('fa-regular', 'fa-solid');
  } else {
    saveBtn.classList.remove('saved');
    saveBtn.querySelector('i').classList.replace('fa-solid', 'fa-regular');
  }
})

const quotes = [
  "Stop waiting to feel ready, Ready is not a feeling. It's decision.",
  "You are stronger than you think and braver than you feel.",
  "Breathe. It’s just a bad day, not a bad life.",
  "Be proud of how far you’ve come, and have faith in how far you can go.",
  "One day or day one, You decide.",
  "Your future needs you, your past doesn’t.",
  "Every sunsise is a reminder that you have another chance to be better.",
  "The only time you should ever look back, is to see how far you've come.",
  "One bad chapter does not define your whole story.",
  "You are doing enough.",
  "Nothing will work unless you do.",
  "Focus on improving yourself, not proving yourself."
];

document.addEventListener("DOMContentLoaded", () => {

  const quoteText = document.getElementById("quotes-text");
  const nextBtn = document.getElementById("next-btn");

  let currentIndex = 0;
  quoteText.textContent = quotes[currentIndex];

  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % quotes.length;
    quoteText.textContent = quotes[currentIndex];
  });
});