import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { 
  getDatabase, ref, onValue, push, get 
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
  appId: "1:430536291894:web:9f3d2482d5ce933ca70a97"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const hallContainer = document.getElementById("hallContainer");

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Fetch halls
    onValue(ref(db, "partyhall"), (snapshot) => {
      hallContainer.innerHTML = "";
      snapshot.forEach((childSnapshot) => {
        const hallId = childSnapshot.key;
        const hall = childSnapshot.val();
        
        const div = document.createElement("div");
        div.classList.add("hall-card");
        div.innerHTML = `
          <h2>${hall.name}</h2>
          <img src="${hall.img}" alt="${hall.name}">
          <p><strong>Timing:</strong> ${hall.timing}</p>
          <p><strong>Capacity:</strong> ${hall.capacity} people</p>
          <p><strong>Price:</strong> ₹${hall.price}</p>
          <button class="book-btn" data-id="${hallId}">Book Now</button>
        `;
        hallContainer.appendChild(div);
      });

      // Booking button click
      document.querySelectorAll(".book-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const hallId = e.target.getAttribute("data-id");

          // Fetch hall details
          const hallSnap = await get(ref(db, "partyhall/" + hallId));
          const hallData = hallSnap.val();

          // Fetch voyager details (assuming saved under "voyagers/{uid}")
          const voyagerSnap = await get(ref(db, "voyagers/" + user.uid));
          const voyagerData = voyagerSnap.val();

          // Save booking with voyager details
          await push(ref(db, "bookings/partyhall"), {
            type: "partyhall",
            hallName: hallData.name,
            hallTiming: hallData.timing,
            hallCapacity: hallData.capacity,
            hallPrice: hallData.price,
            hallImg: hallData.img,
            voyagerName: voyagerData?.name || user.displayName || "Unknown",
            voyagerEmail: user.email,
            voyagerPhone: voyagerData?.phone || "Not Provided",
            uid: user.uid,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
          });

          alert(
            `✅ Booking Confirmed!\n` +
            `Voyager: ${voyagerData?.name || user.displayName}\n` +
            `Email: ${user.email}\n` +
            `Phone: ${voyagerData?.phone || "N/A"}\n` +
            `Hall: ${hallData.name}\n` +
            `Our team will contact you shortly.`
          );
        });
      });
    });
  } else {
    hallContainer.innerHTML = "<p>Please login to book a hall.</p>";
  }
});
