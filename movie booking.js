import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjSrZdrjl5KupKgL28AuPoDSQkgwcFGFs",
  authDomain: "cruise-ed24d.firebaseapp.com",
  databaseURL: "https://cruise-ed24d-default-rtdb.firebaseio.com",
  projectId: "cruise-ed24d",
  storageBucket: "cruise-ed24d.appspot.com",
  messagingSenderId: "430536291894",
  appId: "1:430536291894:web:9f3d2482d5ce933ca70a97"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM elements
const movieInput = document.getElementById("movie");
const movieDisplay = document.getElementById("movieDisplay");
const bookingForm = document.getElementById("bookingForm");
const seatLayout = document.getElementById("seatLayout");
const seatInput = document.getElementById("seat");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");

// Get selected movie from URL
const params = new URLSearchParams(window.location.search);
const selectedMovie = params.get("movie");

if (selectedMovie) {
  movieInput.value = selectedMovie;
  movieDisplay.textContent = `🎬 Booking for: ${selectedMovie}`;
}

// Generate seat layout
const rows = 5;
const cols = 8;
const seats = [];

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const seatLabel = String.fromCharCode(65 + r) + (c + 1);
    const seat = document.createElement("div");
    seat.classList.add("seat");
    seat.textContent = seatLabel;
    seat.dataset.seat = seatLabel;
    seatLayout.appendChild(seat);
    seats.push(seat);
  }
}

// Load booked seats from Firebase
function loadBookedSeats(movie, date, time) {
  const bookingsRef = ref(db, "bookings/movies");

  onValue(bookingsRef, (snapshot) => {
    const data = snapshot.val();

    // Reset all seats
    seats.forEach(seat => seat.classList.remove("booked", "selected"));

    if (data) {
      Object.values(data).forEach(booking => {
        if (
          booking.movie === movie &&
          booking.date === date &&
          booking.time === time
        ) {
          const bookedSeat = seats.find(s => s.dataset.seat === booking.seat);
          if (bookedSeat) {
            bookedSeat.classList.add("booked");
          }
        }
      });
    }
  });
}

// Refresh booked seats when date/time changes
[dateInput, timeInput].forEach(input => {
  input.addEventListener("change", () => {
    if (movieInput.value && dateInput.value && timeInput.value) {
      loadBookedSeats(movieInput.value, dateInput.value, timeInput.value);
    }
  });
});

// Seat selection
seatLayout.addEventListener("click", (e) => {
  const target = e.target;
  if (target.classList.contains("seat") && !target.classList.contains("booked")) {
    target.classList.toggle("selected");

    const selectedSeats = seats
      .filter(seat => seat.classList.contains("selected"))
      .map(seat => seat.dataset.seat);

    seatInput.value = selectedSeats.join(", ");
  }
});

// Form submission
bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const movie = movieInput.value;
  const date = dateInput.value;
  const time = timeInput.value;
  const selectedSeats = seatInput.value.split(",").map(s => s.trim()).filter(Boolean);

  if (!movie || !date || !time || selectedSeats.length === 0) {
    alert("Please fill all fields and select at least one seat.");
    return;
  }

  const bookingsRef = ref(db, "bookings/movies");

  selectedSeats.forEach(seat => {
    const bookingData = {
      movie,
      date,
      time,
      seat
    };
    push(bookingsRef, bookingData);
  });

  // Redirect to confirmation page
  const seatParam = encodeURIComponent(selectedSeats.join(", "));
  window.location.href = `confirmation.html?movie=${encodeURIComponent(movie)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&seats=${seatParam}`;
});
