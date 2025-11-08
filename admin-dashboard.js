import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, onValue, push, remove, get, set } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app);

const logoutBtn = document.getElementById("logoutBtn");
const contentArea = document.getElementById("contentArea");
const sidebarButtons = document.querySelectorAll(".sidebar button");

// Auth state check and admin verification
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const adminRef = ref(db, `admins/${user.uid}`);
    const snapshot = await get(adminRef);
    if (snapshot.exists() && snapshot.val() === true) {
      enableUI();
    } else {
      await signOut(auth);
      alert("You are not authorized as admin.");
      window.location.href = "admin-login.html";
    }
  } else {
    window.location.href = "admin-login.html";
  }
});

function enableUI() {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });

  sidebarButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      loadSection(btn.dataset.section);
    });
  });

  if (sidebarButtons.length) {
    loadSection(sidebarButtons[0].dataset.section);
  }
}

async function loadSection(section) {
  contentArea.innerHTML = `
    <h2>${section.toUpperCase()}</h2>
    <form id="addForm" enctype="multipart/form-data">
      <input type="text" id="itemName" placeholder="Name" required />
      <input type="number" id="itemPrice" placeholder="Price" required />
      <input type="file" id="itemImage" accept="image/*" required />
      <button type="submit">Add</button>
    </form>
    <div class="item-list" id="itemList"></div>
  `;

  const listRef = ref(db, section);
  const listDiv = document.getElementById("itemList");

  onValue(listRef, (snapshot) => {
    const data = snapshot.val();
    listDiv.innerHTML = "";
    if (data) {
      for (const id in data) {
        const item = data[id];
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
         <img src="${item.img || 'placeholder.jpg'}" 
     alt="${item.name}" 
     style="width:80px; height:60px; object-fit:cover; margin-right:10px; vertical-align:middle;" />

          <span>${item.name} - ₹${item.price}</span>
          <button data-id="${id}" class="edit-btn">Edit</button>
          <button data-id="${id}" class="delete-btn">Delete</button>
        `;
        listDiv.appendChild(div);
      }

      listDiv.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          startEdit(section, btn.dataset.id, data[btn.dataset.id]);
        });
      });

      listDiv.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          remove(ref(db, `${section}/${btn.dataset.id}`));
        });
      });
    } else {
      listDiv.textContent = "No items found.";
    }
  });

  document.getElementById("addForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("itemName").value.trim();
    const price = parseFloat(document.getElementById("itemPrice").value);
    const fileInput = document.getElementById("itemImage");
    const file = fileInput.files[0];

    if (!name || isNaN(price) || !file) {
      alert("Please enter valid name, price, and select an image.");
      return;
    }

    try {
      const imageRef = storageRef(storage, `images/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const imageUrl = await getDownloadURL(imageRef);

      await push(listRef, { name, price, image: imageUrl });
      e.target.reset();
    } catch (error) {
      alert("Failed to add item: " + error.message);
    }
  });
}

function startEdit(section, id, item) {
  contentArea.innerHTML = `
    <h2>Edit Item</h2>
    <form id="editForm" enctype="multipart/form-data">
      <input type="text" id="editName" value="${item.name}" required />
      <input type="number" id="editPrice" value="${item.price}" required />
    <img src="${item.img || 'placeholder.jpg'}" 
     alt="${item.name}" 
     style="width:120px; height:90px; object-fit:cover; display:block; margin-bottom:10px;" />


      <input type="file" id="editImage" accept="image/*" />
      <button type="submit">Save Changes</button>
      <button type="button" id="cancelEdit">Cancel</button>
    </form>
  `;

  const editForm = document.getElementById("editForm");
  const cancelEdit = document.getElementById("cancelEdit");

  cancelEdit.addEventListener("click", () => {
    loadSection(section);
  });

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("editName").value.trim();
    const price = parseFloat(document.getElementById("editPrice").value);
    const fileInput = document.getElementById("editImage");
    const file = fileInput.files[0];

    if (!name || isNaN(price)) {
      alert("Please enter valid name and price.");
      return;
    }

    try {
      let imageUrl = item.image || null;
      if (file) {
        const imageRef = storageRef(storage, `images/${Date.now()}_${file.name}`);
        await uploadBytes(imageRef, file);
        imageUrl = await getDownloadURL(imageRef);
      }

      await set(ref(db, `${section}/${id}`), { name, price, image: imageUrl });
      loadSection(section);
    } catch (error) {
      alert("Failed to update item: " + error.message);
    }
  });
}
