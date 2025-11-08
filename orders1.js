 
  // ================= Firebase Config =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Firebase configuration
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
const auth = getAuth(app);

const ordersList = document.getElementById("ordersList");

// ================= Load Orders =================
onAuthStateChanged(auth, (user) => {
  if (user) {
    const ordersRef = ref(db, "stationeryOrders");
    onValue(ordersRef, (snapshot) => {
      ordersList.innerHTML = "";

      if (!snapshot.exists()) {
        ordersList.innerHTML = "<p>No orders found.</p>";
        return;
      }

      snapshot.forEach((childSnap) => {
        const order = childSnap.val();

        // handle items whether array or object
        const itemsList = Array.isArray(order.items)
          ? order.items.map((i) => `${i.name} (₹${i.price} x ${i.quantity})`).join(", ")
          : Object.values(order.items || {}).map((i) => `${i.name} (₹${i.price} x ${i.quantity})`).join(", ");

        const li = document.createElement("li");
        li.innerHTML = `
          <strong>🆔 Order ID:</strong> ${childSnap.key} <br>
          <strong>📅 Date:</strong> ${order.date || ""} 
          <strong>⏰ Time:</strong> ${order.time || ""} <br>
          <strong>🏠 Room:</strong> ${order.room || ""} <br>
          <strong>🛒 Items:</strong> ${itemsList} <br>
          <strong>💰 Total:</strong> ₹${order.totalPrice || 0} <br>
          <strong>📌 Status:</strong> confirm
          <hr>
        `;
        ordersList.appendChild(li);
      });
    });
  } else {
    ordersList.innerHTML = "<p>Please login to see orders.</p>";
  }
});
