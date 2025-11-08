// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
 apiKey: "AIzaSyBjSrZdrjl5KupKgL28AuPoDSQkgwcFGFs",
  authDomain: "cruise-ed24d.firebaseapp.com",
  projectId: "cruise-ed24d",
  storageBucket: "cruise-ed24d.firebasestorage.app",
  messagingSenderId: "430536291894",
  appId: "1:430536291894:web:9f3d2482d5ce933ca70a97",
  measurementId: "G-EJQPKYB2S2"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM Elements
const container = document.getElementById("fitnessContainer");

// Load fitness services
const servicesRef = ref(db, "fitness");
onValue(servicesRef, (snapshot) => {
  container.innerHTML = "";
  snapshot.forEach(child => {
    const data = child.val();
    container.innerHTML += `
      <div class="card">
        <img src="${data.img}" alt="${data.name}" />
        <h3>${data.name}</h3>
        <p>Trainer: ${data.trainer}</p>
        <p>Time: ${data.time}</p>
        <p>Price: ₹${data.price}</p>
       <a href="fitbook.html?id=${child.key}">
  <button>Book Now</button>
</a>

      </div>
    `;
  });
});

// Book a slot
function book(serviceId) {
  const bookingRef = ref(db, "bookings");
  push(bookingRef, {
    serviceId: serviceId,
    bookedAt: new Date().toISOString()
  });
  alert("Slot booked!");
}
