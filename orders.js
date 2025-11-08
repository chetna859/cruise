// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, onValue, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
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

// DOM
const ordersContainer = document.getElementById("orders-container");

// ✅ Show orders
onAuthStateChanged(auth, (user) => {
  if (!user) {
    ordersContainer.innerHTML = "<p>Please log in to view your orders.</p>";
    return;
  }

  // Fetch orders for this voyager
  const ordersRef = query(ref(db, "cateringOrders"), orderByChild("uid"), equalTo(user.uid));
  onValue(ordersRef, (snapshot) => {
    ordersContainer.innerHTML = "";

    if (!snapshot.exists()) {
      ordersContainer.innerHTML = "<p>No orders found.</p>";
      return;
    }

    snapshot.forEach((childSnap) => {
      const order = childSnap.val();

      // Order Card
      const div = document.createElement("div");
      div.classList.add("order-card");

      let itemsHtml = order.items.map(i => `<li>${i.name} (x${i.quantity}) - ₹${i.price * i.quantity}</li>`).join("");

      div.innerHTML = `
        <h3>Order ID: ${childSnap.key}</h3>
        <p><strong>Date:</strong> ${order.date} ${order.time}</p>
        <p><strong>Name:</strong> ${order.name}</p>
        <p><strong>Room:</strong> ${order.room}</p>
        <p><strong>Phone:</strong> ${order.phone}</p>
        <ul>${itemsHtml}</ul>
        <p><strong>Total:</strong> ₹${order.total}</p>
      `;

      ordersContainer.appendChild(div);
    });
  });
});
