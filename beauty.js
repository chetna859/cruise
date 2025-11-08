// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Firebase config
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

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// DOM elements
const serviceContainer = document.querySelector(".service-container");
const bookingModal = document.getElementById("bookingModal");
const confirmationModal = document.getElementById("confirmationModal");
const bookingsContainer = document.getElementById("bookingsContainer"); // New container for manager

let isAdmin = false;

// Check if admin is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (user.email === "chetnaojha123@gmail.com") {  // Manager email
      isAdmin = true;
      console.log("Manager logged in");
      loadBookings(); // Load bookings for manager
    }
  }
  loadSalonServices();
});

// Load salon services
function loadSalonServices() {
  const servicesRef = ref(db, "salon services");
  onValue(servicesRef, (snapshot) => {
    serviceContainer.innerHTML = ""; // clear
    snapshot.forEach((child) => {
      const service = child.val();
      const div = document.createElement("div");
      div.className = "service-card";
      div.setAttribute("data-service", service.name);
      div.setAttribute("data-price", service.price);
      div.innerHTML = `
        <i class="fas fa-star"></i>
        <h3>${service.name}</h3>
        <p>₹${service.price}</p>
      `;
      serviceContainer.appendChild(div);
    });

    // Add click handlers
    document.querySelectorAll(".service-card").forEach((card) => {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        const name = card.getAttribute("data-service");
        const price = card.getAttribute("data-price");
        document.getElementById("service").value = name;
        document.getElementById("price").value = price;
        bookingModal.style.display = "flex";
      });
    });
  });
}

// Booking submission
document.getElementById("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();

 
  const service = document.getElementById("service").value;
  const price = document.getElementById("price").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  // Show confirmation
  document.getElementById("confirmName").textContent = voyagerName;
  document.getElementById("confirmPhone").textContent = voyagerPhone;
  document.getElementById("confirmService").textContent = service;
  document.getElementById("confirmPrice").textContent = "₹" + price;
  document.getElementById("confirmDate").textContent = date;
  document.getElementById("confirmTime").textContent = time;

  bookingModal.style.display = "none";
  confirmationModal.style.display = "flex";

  // Save booking to Firebase
  const bookingRef = ref(db, "bookings/salon services");
 
  push(bookingRef, {
    name: voyagerName,
    phone: voyagerPhone,
    service,
    price,
    date,
    time
  });

  document.getElementById("bookingForm").reset();
});

 
// Close modals
document.getElementById('booking-close').addEventListener('click', () => {
  bookingModal.style.display = 'none';
});
document.querySelector('.confirm-close').addEventListener('click', () => {
  confirmationModal.style.display = 'none';
});

// Load all bookings (manager view)
function loadBookings() {
  const bookingRef = ref(db, "bookings/salon services");
  onValue(bookingRef, (snapshot) => {
    bookingsContainer.innerHTML = ""; // clear
    snapshot.forEach((child) => {
      const booking = child.val();
      const div = document.createElement("div");
      div.className = "booking-card";
      div.innerHTML = `
        <p><strong>Name:</strong> ${booking.name}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Service:</strong> ${booking.service}</p>
        <p><strong>Price:</strong> ₹${booking.price}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
      `;
      bookingsContainer.appendChild(div);
    });
  });
}
// Fetch voyager details when logged in
let voyagerName = "";
let voyagerPhone = "";

onAuthStateChanged(auth, (user) => {
  if (user) {
    const voyagerRef = ref(db, "voyagers/" + user.uid); // assuming details stored under voyagers/{uid}
    onValue(voyagerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        voyagerName = data.name;
        voyagerPhone = data.phone;
      }
    });

    if (user.email === "chetnaojha123@gmail.com") {
      isAdmin = true;
      loadBookings();
    }
  }
  loadSalonServices();
});
