 // Import Firebase
    import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
    import { getDatabase, ref, get, push } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

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

    // Init Firebase
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    // Get serviceId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get("id");

    // Fetch service details
    const serviceRef = ref(db, "fitness/" + serviceId);
    get(serviceRef).then(snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        document.getElementById("bookingDetails").innerHTML = `
          <div class="card">
            <img src="${data.img}" alt="${data.name}" />
            <h2>${data.name}</h2>
            <p><strong>Trainer:</strong> ${data.trainer}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Price:</strong> ₹${data.price}</p>
            <label>Date: <input type="date" id="bookingDate" required></label><br><br>
            <button id="confirmBooking">Confirm Booking</button>
          </div>
        `;

        // Confirm booking
        document.getElementById("confirmBooking").addEventListener("click", () => {
          const bookingDate = document.getElementById("bookingDate").value;
          if (!bookingDate) {
            alert("Please select a date.");
            return;
          }

          const bookingData = {
            serviceId,
            name: data.name,
            trainer: data.trainer,
            time: data.time,
            price: data.price,
            date: bookingDate
          };

          // Save booking in Firebase
          push(ref(db, "bookings/fitness"), bookingData);

          // Redirect to confirmation page
          const redirectURL = `fit-confirmation.html?name=${encodeURIComponent(data.name)}&trainer=${encodeURIComponent(data.trainer)}&time=${encodeURIComponent(data.time)}&price=${encodeURIComponent(data.price)}&date=${encodeURIComponent(bookingDate)}`;
          window.location.href = redirectURL;
        });
      } else {
        document.getElementById("bookingDetails").innerHTML = `<p>Service not found.</p>`;
      }
    });