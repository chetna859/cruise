// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, push, set, get } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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

// DOM elements
const cartContainer = document.getElementById("cart-container");
const totalPriceElem = document.getElementById("total-price");
const placeOrderBtn = document.getElementById("placeOrderBtn");

// Modal
const confirmationModal = document.getElementById("confirmationModal");
const closeModal = document.querySelector(".close");
const confirmName = document.getElementById("confirmName");
const confirmPhone = document.getElementById("confirmPhone");
const confirmTotal = document.getElementById("confirmTotal");

// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ✅ Update Cart UI
function updateCart() {
  cartContainer.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p style='text-align: center; color: red;'>Your cart is empty.</p>";
    totalPriceElem.textContent = "";
    return;
  }

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      ${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}
      <button class="remove-btn" data-index="${index}">Remove</button>
    `;
    cartContainer.appendChild(div);
  });

  totalPriceElem.textContent = `Total: ₹${total}`;

  // Remove button event
  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCart();
    });
  });
}

// ✅ Place Order
placeOrderBtn.addEventListener("click", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Please log in to place an order.");
      return;
    }
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      // Fetch voyager details
      const voyagerRef = ref(db, `voyagers/${user.uid}`);
      const voyagerSnap = await get(voyagerRef);

      if (!voyagerSnap.exists()) {
        alert("Voyager details not found. Please contact admin.");
        return;
      }

      const data = voyagerSnap.val();
      const name = data.name ?? "Unknown";
      const phone = data.phone ?? "Unknown";

      const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

      // Save order
      const newOrderRef = push(ref(db, "cateringOrders"));
      await set(newOrderRef, {
        uid: user.uid,
        name: data.name,
        phone: data.phone,
        room: data.room,
        items: cart,
        total,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        timestamp: Date.now(),
      });

      // Show modal
      confirmName.textContent = name;
      confirmPhone.textContent = phone;
      confirmTotal.textContent = total;
      confirmationModal.style.display = "block";

      // Clear cart
      cart = [];
      localStorage.removeItem("cart");
      updateCart();
      setTimeout(() => {
  window.location.href = "orders.html";
}, 2000);

    } catch (err) {
      console.error("❌ Error placing order:", err);
      alert("Error placing order: " + err.message);
    }
  });
});

// Close modal
closeModal.addEventListener("click", () => {
  confirmationModal.style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === confirmationModal) confirmationModal.style.display = "none";
});

// Initial load
updateCart();
