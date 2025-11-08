import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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

const ordersContainer = document.getElementById('ordersContainer');

// Check if supervisor is logged in
onAuthStateChanged(auth, (user) => {
  if (user && user.email === "komaldave123@gmail.com") { // replace with your supervisor email
    loadStationeryOrders();
  } else {
    alert("Access denied!");
    window.location.href = "supervisor-login.html";
  }
});

function loadStationeryOrders() {
  const ordersRef = ref(db, "stationeryOrders");
  onValue(ordersRef, (snapshot) => {
    ordersContainer.innerHTML = '';
    snapshot.forEach(childSnapshot => {
      const order = childSnapshot.val();
      const div = document.createElement('div');
      div.classList.add('order-card');
      div.innerHTML = `
        <h3>${order.name} (${order.phone})</h3>
        <p><strong>Total:</strong> ₹${order.totalPrice}</p>
        <p><strong>Date:</strong> ${order.date} <strong>Time:</strong> ${order.time}</p>
        <ul>
          ${order.items.map(item => `<li>${item.name} x${item.qty} - ₹${item.price * item.qty}</li>`).join('')}
        </ul>
      `;
      ordersContainer.appendChild(div);
    });
  });
}
