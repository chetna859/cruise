// Import Firebase modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

// Your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyBjSrZdrjl5KupKgL28AuPoDSQkgwcFGFs",
  authDomain: "cruise-ed24d.firebaseapp.com",
  databaseURL: "https://cruise-ed24d-default-rtdb.firebaseio.com",
  projectId: "cruise-ed24d",
  storageBucket: "cruise-ed24d.appspot.com",
  messagingSenderId: "430536291894",
  appId: "1:430536291894:web:9f3d2482d5ce933ca70a97",
  measurementId: "G-EJQPKYB2S2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

window.addEventListener('DOMContentLoaded', () => {
  const resortList = document.querySelector('.resort-list');

  // Reference to "resortBookings" node
  const resortsRef = ref(db, 'resortBookings');

  onValue(resortsRef, (snapshot) => {
    resortList.innerHTML = ''; // Clear existing
    const resorts = snapshot.val();
    if (resorts) {
      Object.keys(resorts).forEach(key => {
        const resort = resorts[key];

        // ✅ Safety check for missing fields
        const imgUrl = resort.img || "placeholder.jpg";
        const name = resort.name || "Unnamed Resort";

        // Create resort card
        const card = document.createElement('div');
        card.className = 'resort-card';

        const img = document.createElement('img');
        img.src = imgUrl;
        img.alt = name;

        const h2 = document.createElement('h2');
        h2.textContent = name;

        const btn = document.createElement('button');
        btn.textContent = 'Book Now';
        btn.onclick = () => {
          localStorage.setItem('selectedResort', name);
          window.location.href = 'resort booking.html';
        };

        card.appendChild(img);
        card.appendChild(h2);
        card.appendChild(btn);
        resortList.appendChild(card);
      });
    } else {
      resortList.textContent = 'No resorts available at the moment.';
    }
  });
});
