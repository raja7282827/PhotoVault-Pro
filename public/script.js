function showSection(section) {
  alert("You clicked: " + section);
}

// let home=document.querySelector('#home-container')
// let bt=DocumentFragment.querySelector('#change-element')

function uploadPhoto() {
  const input = document.getElementById("photoInput");
  const file = input.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.width = "200px"; 
      img.style.margin = "10px";

      
      document.getElementById("gallery-container").appendChild(img);
    };
    reader.readAsDataURL(file);
  }
}
// Bubble container
const bubbleContainer = document.querySelector(".bubbles");

// Different gradients for multicolor bubbles
const gradients = [
  "radial-gradient(circle at 30% 30%, rgba(255,0,150,0.6), rgba(0,200,255,0.4))",
  "radial-gradient(circle at 30% 30%, rgba(0,255,150,0.6), rgba(0,100,255,0.4))",
  "radial-gradient(circle at 30% 30%, rgba(255,200,0,0.6), rgba(255,0,100,0.4))",
  "radial-gradient(circle at 30% 30%, rgba(150,0,255,0.6), rgba(0,255,200,0.4))"
];

// Function to create one bubble
function createBubble() {
  const bubble = document.createElement("div");
  bubble.classList.add("bubble");

  // Random size (20px - 60px)
  let size = Math.random() * 40 + 20; 
  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;

  // Random horizontal position
  bubble.style.left = Math.random() * window.innerWidth + "px";

  // Random animation duration (5s - 10s)
  bubble.style.animationDuration = Math.random() * 5 + 5 + "s";
  // bubble.style.animationDelay = Math.random() * 3 + "s";


  // Random gradient color
  bubble.style.background = gradients[Math.floor(Math.random() * gradients.length)];

  // Add to container
  bubbleContainer.appendChild(bubble);

  // Remove after animation ends
  setTimeout(() => bubble.remove(), 10000);
}

// Har 500ms me ek bubble create hoga
setInterval(createBubble, 500);










