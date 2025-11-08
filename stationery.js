// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
  remove,
  update,
  set
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/********************
 * Firebase config  *
 ********************/
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

/********************
 * Popup function   *
 ********************/
function showPopup(message) {
  let popup = document.getElementById("popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "popup";
    popup.className = "popup";
    document.body.appendChild(popup);
  }

  popup.textContent = message;
  popup.style.display = "block";

  setTimeout(() => {
    popup.style.display = "none";
  }, 2000);
}

/********************
 * Role management  *
 ********************/
const ADMIN_EMAILS = ["chetnaojha123@gmail.com"]; 
const SUPERVISOR_EMAILS = ["supervisor@example.com"]; 

let currentUser = null;
let isAdmin = false;
let isSupervisor = false;

onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
  isAdmin = !!(user && ADMIN_EMAILS.includes(user.email));
  isSupervisor = !!(user && SUPERVISOR_EMAILS.includes(user.email));

  loadCatalog();
});

/********************
 * DOM references   *
 ********************/
const itemList = document.getElementById("itemList");
const cartList = document.getElementById("cartList");
const totalEl = document.getElementById("total");
const searchInput = document.getElementById("searchInput");
const stationeryContainer = document.getElementById("stationeryContainer");

// Customer details
const customerNameInput = document.getElementById("customerName");
const customerPhoneInput = document.getElementById("customerPhone");
const placeOrderBtn = document.getElementById("placeOrderBtn");

// Modal elements
const confirmationModal = document.getElementById("confirmationModal");
const closeModal = document.querySelector(".close");
const confirmName = document.getElementById("confirmName");
const confirmPhone = document.getElementById("confirmPhone");
const confirmTotal = document.getElementById("confirmTotal");

// Menu / hamburger
const hamburger = document.getElementById("hamburger");
const menu = document.getElementById("menu");

/********************
 * Local state      *
 ********************/
let catalog = [];
let cart = [];

/********************
 * Helpers          *
 ********************/
const currency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function findCartIndexById(id) {
  return cart.findIndex((c) => c.id === id);
}

/********************
 * Catalog loading  *
 ********************/
function loadCatalog() {
  const itemsRef = ref(db, "stationery");
  onValue(itemsRef, (snapshot) => {
    const val = snapshot.val();
    catalog = val ? Object.entries(val).map(([id, v]) => ({ id, ...v })) : [];
    renderItems(catalog);
    renderAdminGrid(catalog);
  });
}

/********************
 * Renderers        *
 ********************/
function renderItems(data) {
  if (!itemList) return;
  itemList.innerHTML = "";

  data.forEach((item) => {
    const li = document.createElement("li");
    li.className = "stationery-item";

    // Check if item is in cart
    const cartItem = cart.find(c => c.id === item.id);

    li.innerHTML = `
      <div class="item-name">${item.name || "Unnamed"}</div>
      ${item.img ? `<img src="${item.img}" alt="${item.name}" class="item-img" />` : ""}
      <div class="item-price">${currency(item.price)}</div>
      <div class="cart-action">
        ${
          cartItem
            ? `<button data-dec="${item.id}">-</button>
               <span class="qty">${cartItem.qty}</span>
               <button data-inc="${item.id}">+</button>`
            : `<button data-add="${item.id}">Add to Cart</button>`
        }
      </div>
    `;
    itemList.appendChild(li);
  });
}

function renderAdminGrid(data) {
  if (!stationeryContainer) return;
  stationeryContainer.innerHTML = "";

  data.forEach((item) => {
    const div = document.createElement("div");
    div.className = "stationery-card";
    div.innerHTML = `
      <h2>${item.name || "Unnamed"}</h2>
      ${item.img ? `<img src="${item.img}" alt="${item.name}">` : ""}
      <p><strong>Price:</strong> ${currency(item.price)}</p>
      ${isAdmin ? `
        <div class="admin-actions">
          <button data-edit="${item.id}">Edit</button>
          <button data-delete="${item.id}">Delete</button>
        </div>
      ` : ""}
    `;
    stationeryContainer.appendChild(div);
  });
}

function renderCart() {
  if (!cartList) return;
  cartList.innerHTML = "";

  let total = 0;
  cart.forEach((item) => {
    const li = document.createElement("li");
    const lineTotal = (Number(item.price) || 0) * (Number(item.qty) || 1);
    total += lineTotal;

    li.innerHTML = `
      <span>${item.name} (x${item.qty}) – ${currency(lineTotal)}</span>
      <div class="row-actions">
        <button data-dec="${item.id}">-</button>
        <button data-inc="${item.id}">+</button>
        <button data-rem="${item.id}">Remove</button>
      </div>
    `;
    cartList.appendChild(li);
  });

  if (totalEl) totalEl.textContent = `Total: ${currency(total)}`;
}

/********************
 * Event delegation *
 ********************/
/********************
 * Event delegation *
 ********************/
if (itemList) {
  itemList.addEventListener("click", (e) => {
    const addBtn = e.target.closest("button[data-add]");
    const decBtn = e.target.closest("button[data-dec]");
    const incBtn = e.target.closest("button[data-inc]");

    let id;
    if (addBtn) id = addBtn.getAttribute("data-add");
    if (decBtn) id = decBtn.getAttribute("data-dec");
    if (incBtn) id = incBtn.getAttribute("data-inc");
    if (!id) return;

    const item = catalog.find(i => i.id === id);
    if (!item) return;

    const idx = findCartIndexById(id);

    if (addBtn) {
      // Add item to local cart
      cart.push({ id: item.id, name: item.name, price: Number(item.price), qty: 1 });

      // Save to Firebase cart
      if (auth.currentUser) {
        set(ref(db, "stationeryCarts/" + auth.currentUser.uid + "/" + item.id), {
          id: item.id,
          name: item.name,
          price: Number(item.price),
          qty: 1
        });
      }

      // Replace Add button with quantity selector
      const container = addBtn.parentElement;
      container.innerHTML = `
        <button data-dec="${item.id}">-</button>
        <span class="qty" style="color: black;">1</span>
        <button data-inc="${item.id}">+</button>
      `;

      showPopup(`${item.name} added to cart ✅`);
    } 
    else if (decBtn && idx >= 0) {
      cart[idx].qty = Math.max(1, cart[idx].qty - 1);

      // Update Firebase
      if (auth.currentUser) {
        set(ref(db, "stationeryCarts/" + auth.currentUser.uid + "/" + item.id), {
          ...cart[idx]
        });
      }

      const qtySpan = decBtn.parentElement.querySelector(".qty");
      if (qtySpan) qtySpan.textContent = cart[idx].qty;
    } 
    else if (incBtn && idx >= 0) {
      cart[idx].qty += 1;

      // Update Firebase
      if (auth.currentUser) {
        set(ref(db, "stationeryCarts/" + auth.currentUser.uid + "/" + item.id), {
          ...cart[idx]
        });
      }

      const qtySpan = incBtn.parentElement.querySelector(".qty");
      if (qtySpan) qtySpan.textContent = cart[idx].qty;
    }

    renderCart(); // update cart totals
  });
}



if (searchInput) {
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = catalog.filter((i) => (i.name || "").toLowerCase().includes(q));
    renderItems(filtered);
  });
}

/********************
 * Admin actions    *
 ********************/
if (stationeryContainer) {
  stationeryContainer.addEventListener("click", async (e) => {
    const delBtn = e.target.closest("button[data-delete]");
    const editBtn = e.target.closest("button[data-edit]");

    if (delBtn && isAdmin) {
      const id = delBtn.getAttribute("data-delete");
      if (!confirm("Delete this item?")) return;
      try {
        await remove(ref(db, `stationery/${id}`));
        alert("Item deleted.");
      } catch (err) {
        alert("Error deleting item: " + err.message);
      }
    }

    if (editBtn && isAdmin) {
      const id = editBtn.getAttribute("data-edit");
      const item = catalog.find((i) => i.id === id);
      if (!item) return;

      const name = prompt("Name", item.name || "");
      if (name === null) return;
      const priceStr = prompt("Price (number)", String(item.price ?? ""));
      if (priceStr === null) return;
      const price = Number(priceStr);
      if (Number.isNaN(price)) return alert("Invalid price");
      const img = prompt("Image URL", item.img || "");
      if (img === null) return;

      try {
        await update(ref(db, `stationery/${id}`), { name, price, img });
        alert("Item updated.");
      } catch (err) {
        alert("Error updating item: " + err.message);
      }
    }
  });
}

/********************
 * Place order      *
 ********************/
if (placeOrderBtn) {
  placeOrderBtn.addEventListener("click", async () => {
    const customerName = (customerNameInput?.value || "").trim();
    const customerPhone = (customerPhoneInput?.value || "").trim();

    if (!customerName || !customerPhone) return alert("Please enter your name and phone number.");
    if (cart.length === 0) return alert("Cart is empty.");

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const now = new Date();

    const order = {
      name: customerName,
      phone: customerPhone,
      items: cart,
      totalPrice,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      createdBy: currentUser ? currentUser.uid : null,
      status: "pending"
    };

    try {
      await push(ref(db, "stationeryOrders"), order);

      if (confirmName) confirmName.textContent = customerName;
      if (confirmPhone) confirmPhone.textContent = customerPhone;
      if (confirmTotal) confirmTotal.textContent = currency(totalPrice);
      if (confirmationModal) confirmationModal.style.display = "block";

      cart = [];
      renderCart();
      renderItems(catalog); // reset quantity selectors
      if (customerNameInput) customerNameInput.value = "";
      if (customerPhoneInput) customerPhoneInput.value = "";

    } catch (err) {
      alert("Error placing order: " + err.message);
    }
  });
}

if (closeModal && confirmationModal) {
  closeModal.addEventListener("click", () => (confirmationModal.style.display = "none"));
}
window.addEventListener("click", (e) => {
  if (e.target === confirmationModal) confirmationModal.style.display = "none";
});

/********************
 * Hamburger menu   *
 ********************/
if (hamburger && menu) {
  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && e.target !== hamburger)
      menu.style.display = "none";
  });
}
