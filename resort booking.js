// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase, ref, push, onValue, serverTimestamp, get
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const form = document.getElementById("bookingForm");
const msg = document.getElementById("msg");

// ✅ Resort name from localStorage (saved when user clicked "Book Now")
let selectedResort = localStorage.getItem("selectedResort") || null;

// Show resort name in booking form (only text, no image)
const selectedResortEl = document.getElementById("selectedResort");
if (selectedResort) {
  selectedResortEl.textContent = `Selected Resort: ${selectedResort}`;
} else {
  selectedResortEl.textContent = "⚠️ No resort selected. Please go back and pick a resort.";
}

// ✅ Booking Form Submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const checkIn  = document.getElementById("checkIn").value;
  const checkOut = document.getElementById("checkOut").value;
  const guests   = parseInt(document.getElementById("guests").value, 10);

  if (!selectedResort || !checkIn || !checkOut || isNaN(guests) || guests <= 0) {
    msg.textContent = "❌ Please select a resort and fill all fields.";
    msg.style.color = "red";
    return;
  }

  // ✅ Wait for voyager
  onAuthStateChanged(auth, async (voyager) => {
    if (!voyager) {
      msg.textContent = "⚠️ Please login to book a resort.";
      msg.style.color = "red";
      return;
    }

    try {
      // 🔹 Get voyager details from DB
      const voyagerRef = ref(db, "voyagers/" + voyager.uid);
      const snapshot = await get(voyagerRef);
      const voyagerData = snapshot.exists() ? snapshot.val() : {};

      const bookingData = {
        voyagerId: voyager.uid,
        voyagerName: voyagerData.name || "Unknown",
        voyagerPhone: voyagerData.phone || "N/A",
        voyagerRoom: voyagerData.room || "N/A",
        resortName: selectedResort,
        checkIn,
        checkOut,
        guests,
        dateRange: `${checkIn} → ${checkOut}`,
        createdAt: Date.now()
      };

      const bookingRef = ref(db, "resort");
      await push(bookingRef, bookingData);

      localStorage.removeItem("selectedResort");
      window.location.href = "booking-success.html";

    } catch (error) {
      msg.textContent = "❌ Booking failed: " + error.message;
      msg.style.color = "red";
    }
  });
});
