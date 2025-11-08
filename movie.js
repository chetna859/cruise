import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";


// Firebase config
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
const db = getDatabase(app);

const movieContainer = document.getElementById("movieContainer");

const movieRef = ref(db, "movies");
onValue(movieRef, (snapshot) => {
  const data = snapshot.val();
  movieContainer.innerHTML = "";

  if (!data) {
    movieContainer.innerHTML = "<p>No movies found.</p>";
    return;
  }

  for (const id in data) {
    const movie = data[id];

    const card = document.createElement("div");
    card.className = "movie-card";

    card.innerHTML = `
  <img src="${movie.img}" alt="${movie.name}" />
  <h2>${movie.name}</h2>
  <button class="book-btn" data-movie="${movie.name}">Book Now</button>
`;


    movieContainer.appendChild(card);
    card.querySelector(".book-btn").addEventListener("click", (e) => {
  const selectedMovie = e.target.getAttribute("data-movie");
  window.location.href = `movie booking.html?movie=${encodeURIComponent(selectedMovie)}`;
});

    
    
  }
   
});
// Read movie name from URL
const params = new URLSearchParams(window.location.search);
const selectedMovie = params.get("movie");

const movieSelect = document.getElementById("movie");

// Set selected movie when movies load
onValue(movieRef, (snapshot) => {
  const data = snapshot.val();
  movieSelect.innerHTML = `<option value="">Select a Movie</option>`;

  for (const id in data) {
    const movie = data[id];
    const option = document.createElement("option");
    option.value = movie.name;
    option.textContent = movie.name;
    movieSelect.appendChild(option);
  }

  // Auto-select movie if coming from home
  if (selectedMovie) {
    movieSelect.value = selectedMovie;
  }
});

