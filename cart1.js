// cart1.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
  remove,
  push,
  get
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// === Firebase config (yours) ===
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

// === DOM ===
const cartList = document.getElementById("cartList");
const totalPriceEl = document.getElementById("totalPrice");
const placeOrderBtn = document.getElementById("placeOrderBtn"); // ✅ correct ID
const closePopup = document.getElementById("closePopup");

// Modal (optional if you already have markup)
let confirmationModal = document.getElementById("confirmationModal");
let confirmName = document.getElementById("confirmName");
let confirmPhone = document.getElementById("confirmPhone");
let confirmTotal = document.getElementById("confirmTotal");
let confirmRoom = document.getElementById("confirmRoom");
let confirmDate = document.getElementById("confirmDate");
let confirmTime = document.getElementById("confirmTime");
const confirmationPopup = document.getElementById("confirmationPopup");

// If your modal didn’t have these spans, we’ll create a simple popup later.
const currency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

let cart = [];
let userProfile = { name: "Guest", phone: "N/A", room: "N/A" };

// --- Helpers ---
async function fetchProfile(uid) {
  // Try voyagers/{uid}
  let snap = await get(ref(db, "voyagers/" + uid));
  if (snap.exists()) return snap.val();

  // Fallback users/{uid}
  snap = await get(ref(db, "users/" + uid));
  if (snap.exists()) return snap.val();

  // Final fallback from Auth
  const u = auth.currentUser;
  return {
    name: (u && (u.displayName || u.email)) || "Guest",
    phone: (u && u.phoneNumber) || "N/A",
    room: "N/A",
  };
}

function renderCart() {
  if (!cartList) return;
  cartList.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    const line = (Number(item.price) || 0) * (Number(item.qty) || 1);
    total += line;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.name} (x${item.qty}) – ${currency(line)}</span>
      <div>
        <button data-dec="${item.id}">-</button>
        <button data-inc="${item.id}">+</button>
        <button data-rem="${item.id}">Remove</button>
      </div>
    `;
    cartList.appendChild(li);
  });

  if (totalPriceEl) totalPriceEl.textContent = `Total: ${currency(total)}`;
}

// --- Event delegation for + / - / Remove ---
if (cartList) {
  cartList.addEventListener("click", (e) => {
    const dec = e.target.closest("button[data-dec]");
    const inc = e.target.closest("button[data-inc]");
    const rem = e.target.closest("button[data-rem]");
    if (!dec && !inc && !rem) return;

    const attrName = dec ? "data-dec" : inc ? "data-inc" : "data-rem";
    const id = (dec || inc || rem).getAttribute(attrName);
    const item = cart.find((i) => i.id === id);
    if (!item || !auth.currentUser) return;

    if (dec) item.qty = Math.max(1, item.qty - 1);
    if (inc) item.qty += 1;

    if (rem) {
      remove(ref(db, `stationeryCarts/${auth.currentUser.uid}/${id}`));
    } else {
      set(ref(db, `stationeryCarts/${auth.currentUser.uid}/${id}`), item);
    }
  });
}

// --- Auth & data load ---
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // not logged in
    return;
  }

  // Load user profile
  userProfile = await fetchProfile(user.uid);

  // Live cart
  const cartRef = ref(db, `stationeryCarts/${user.uid}`);
  onValue(cartRef, (snapshot) => {
    const val = snapshot.val();
    cart = val ? Object.values(val) : [];
    renderCart();
  });
});

// --- Place order ---
if (placeOrderBtn) {
  placeOrderBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please login first!");
      return;
    }
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    const total = cart.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0);
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();

    const order = {
      createdBy: user.uid,
      name: userProfile.name || "Guest",
      phone: userProfile.phone || "N/A",
      room: userProfile.room || "N/A",
      items: cart,
      totalPrice: total,
      date: dateStr,
      time: timeStr,
      status: "pending"
    };

    try {
      // push order and clear cart in DB
      await push(ref(db, "stationeryOrders"), order);
      await remove(ref(db, `stationeryCarts/${user.uid}`)); // clear cart in DB

      // clear local cart state and UI
      cart = [];
      renderCart();

      // Show confirmation in your modal if its spans exist
      if (confirmationModal && confirmName && confirmPhone && confirmRoom && confirmDate && confirmTime && confirmTotal) {
        confirmName.textContent = order.name;
        confirmPhone.textContent = order.phone;
        confirmRoom.textContent = order.room;
        confirmDate.textContent = order.date;
        confirmTime.textContent = order.time;
        confirmTotal.textContent = currency(order.totalPrice);

        confirmationModal.style.display = "block";

        // Redirect after 2 seconds to orders page
        setTimeout(() => {
          window.location.href = "orders1.html";
        }, 2000);
      } else {
        // fallback inline confirmation
        showInlineConfirmation(order);
        // redirect after 2s as well
        setTimeout(() => {
          window.location.href = "orders1.html";
        }, 2000);
      }

    } catch (err) {
      alert("Error placing order: " + (err.message || err));
    }
  });
}

// --- Simple inline confirmation popup (used if your modal doesn't have all fields) ---
function showInlineConfirmation(order) {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:fixed; inset:0; background:rgba(0,0,0,.6);
    display:flex; align-items:center; justify-content:center; z-index:9999;
  `;
  overlay.innerHTML = `
    <div style="background:#fff; padding:20px; border-radius:12px; width:360px; color:#000;">
      <h2>✅ Order Placed</h2>
      <p><strong>Name:</strong> ${order.name}</p>
      <p><strong>Phone:</strong> ${order.phone}</p>
      <p><strong>Room:</strong> ${order.room}</p>
      <p><strong>Date:</strong> ${order.date}</p>
      <p><strong>Time:</strong> ${order.time}</p>
      <p><strong>Total:</strong> ${currency(order.totalPrice)}</p>
      <hr />
      <div style="max-height:160px; overflow:auto; text-align:left;">
        ${order.items.map(i => `<div>${i.name} x ${i.qty} – ${currency((Number(i.price)||0) * (Number(i.qty)||1))}</div>`).join("")}
      </div>
      <div style="text-align:right; margin-top:12px;">
        <button id="okClose" style="padding:8px 14px; border-radius:8px;">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector("#okClose").onclick = () => overlay.remove();
}

// Close button inside popup
if (typeof closePopup !== "undefined" && closePopup && confirmationPopup) {
  closePopup.addEventListener("click", () => {
    confirmationPopup.style.display = "none";
  });

  // Close when clicking outside popup
  window.addEventListener("click", (e) => {
    if (e.target === confirmationPopup) {
      confirmationPopup.style.display = "none";
    }
  });
}

// Close button inside modal (×)
if (confirmationModal) {
  const modalCloseBtn = confirmationModal.querySelector(".close");
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", () => {
      confirmationModal.style.display = "none";
    });

    // Close when clicking outside modal
    window.addEventListener("click", (e) => {
      if (e.target === confirmationModal) {
        confirmationModal.style.display = "none";
      }
    });
  }
}
