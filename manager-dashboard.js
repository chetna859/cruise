import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

// ===== Firebase config (yours) =====
const firebaseConfig = {
  apiKey: "AIzaSyBjSrZdrjl5KupKgL28AuPoDSQkgwcFGFs",
  authDomain: "cruise-ed24d.firebaseapp.com",
  databaseURL: "https://cruise-ed24d-default-rtdb.firebaseio.com",
  projectId: "cruise-ed24d",
  storageBucket: "cruise-ed24d.appspot.com",
  messagingSenderId: "430536291894",
  appId: "1:430536291894:web:9f3d2482d5ce933ca70a97"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getDatabase(app);


const bookingTableBody = document.querySelector("#bookingTable tbody");
const filterDropdown = document.getElementById("serviceFilter");

function loadBookings() {
  bookingTableBody.innerHTML = "";

  const bookingPaths = {
    fitness: ref(db, "bookings/fitness"),
    movies: ref(db, "bookings/movies"),
    partyhall: ref(db, "bookings/partyhall"),
    resort: ref(db, "bookings/resort"),
    salon: ref(db, "bookings/salon services")
  };

  Object.keys(bookingPaths).forEach(serviceType => {
    onValue(bookingPaths[serviceType], snapshot => {
      if (snapshot.exists()) {
        snapshot.forEach(childSnap => {
          const booking = childSnap.val();
          addBookingRow(serviceType, booking);
        });
      }
    });
  });
}

function addBookingRow(serviceType, booking) {
  const filterValue = filterDropdown.value;
  if (filterValue !== "all" && filterValue !== serviceType) return;

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${serviceType}</td>
    <td>${booking.name || "N/A"}</td>
    <td>${booking.date || "N/A"}</td>
    <td>${booking.details || JSON.stringify(booking)}</td>
  `;
  bookingTableBody.appendChild(row);
}

filterDropdown.addEventListener("change", loadBookings);
loadBookings();
