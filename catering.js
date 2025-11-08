// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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

// ✅ Popup function
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

document.addEventListener("DOMContentLoaded", () => {
  const menuContainer = document.getElementById("menu-container");
  const searchBox = document.getElementById("searchBox");
  const logoutBtn = document.getElementById("logoutBtn");
  const hamburger = document.getElementById("hamburger");
  const menu = document.getElementById("menu");

  let recipesData = [];
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Fetch recipes
  const recipesRef = ref(db, "recipes");
  onValue(recipesRef, (snapshot) => {
    recipesData = [];
    snapshot.forEach((childSnapshot) => {
      recipesData.push(childSnapshot.val());
    });
    displayRecipes(recipesData);
  });

  // Display recipes
  function displayRecipes(recipes) {
    menuContainer.innerHTML = "";
    recipes.forEach((recipe) => {
      const card = document.createElement("div");
      card.classList.add("card");

      // Check if already in cart
      const existing = cart.find((c) => c.name === recipe.name);

      card.innerHTML = `
        <img src="${recipe.img}" alt="${recipe.name}">
        <h3>${recipe.name}</h3>
        <p>₹${recipe.price}</p>
        <div class="action-container"></div>
      `;

      const actionContainer = card.querySelector(".action-container");

      if (existing) {
        renderQuantitySelector(actionContainer, existing, recipe);
      } else {
        const addBtn = document.createElement("button");
        addBtn.textContent = "Add to Cart";
        addBtn.classList.add("add-btn");
        addBtn.addEventListener("click", () => {
          const newItem = { name: recipe.name, price: recipe.price, quantity: 1 };
          cart.push(newItem);
          localStorage.setItem("cart", JSON.stringify(cart));
          renderQuantitySelector(actionContainer, newItem, recipe);

          // ✅ Show popup when item is added
          showPopup(`${recipe.name} added to cart ✅`);
        });
        actionContainer.appendChild(addBtn);
      }

      menuContainer.appendChild(card);
    });
  }

  // Render quantity selector 
  function renderQuantitySelector(container, item, recipe) {
    container.innerHTML = `
      <div class="quantity-container">
        <button class="decrease">-</button>
        <span class="quantity">${item.quantity}</span>
        <button class="increase">+</button>
      </div>
    `;

    const qtyEl = container.querySelector(".quantity");
    container.querySelector(".decrease").addEventListener("click", () => {
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        // Remove from cart if goes to 0
        cart = cart.filter((c) => c.name !== recipe.name);
        localStorage.setItem("cart", JSON.stringify(cart));
        displayRecipes(recipesData);

        // ✅ Show popup when removed
        showPopup(`${recipe.name} removed from cart ❌`);
        return;
      }
      qtyEl.textContent = item.quantity;
      localStorage.setItem("cart", JSON.stringify(cart));
    });

    container.querySelector(".increase").addEventListener("click", () => {
      item.quantity++;
      qtyEl.textContent = item.quantity;
      localStorage.setItem("cart", JSON.stringify(cart));

      // ✅ Show popup on increasing quantity
      showPopup(`Increased ${recipe.name} quantity ➕`);
    });
  }

  // Search filter
  searchBox.addEventListener("input", () => {
    const term = searchBox.value.toLowerCase();
    const filtered = recipesData.filter((r) =>
      r.name.toLowerCase().includes(term)
    );
    displayRecipes(filtered);
  });

  // Logout
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => (window.location.href = "index.html"));
  });

  // Hamburger menu
  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && e.target !== hamburger)
      menu.style.display = "none";
  });
});
