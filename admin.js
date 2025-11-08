import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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



// Elements
const loginSection = document.getElementById("loginSection");
const adminSection = document.getElementById("adminSection");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

// Login
loginBtn.addEventListener("click", () => {
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => { loadAllServices(); })
        .catch(err => document.getElementById("loginMessage").innerText = err.message);
});

// Logout
logoutBtn.addEventListener("click", () => signOut(auth));

// Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.style.display = "none";
        adminSection.style.display = "block";
        loadAllServices();
    } else {
        loginSection.style.display = "block";
        adminSection.style.display = "none";
    }
});

// Load & Manage Services
const services = [
    { name: "catering", tableId: "cateringTable", nameId: "cateringName", priceId: "cateringPrice", btnId: "addCateringBtn" },
    { name: "stationary", tableId: "stationaryTable", nameId: "stationaryName", priceId: "stationaryPrice", btnId: "addStationaryBtn" },
    { name: "resort", tableId: "resortTable", nameId: "resortName", priceId: "resortPrice", btnId: "addResortBtn" },
    { name: "movie", tableId: "movieTable", nameId: "movieName", priceId: "moviePrice", btnId: "addMovieBtn" },
    { name: "beauty", tableId: "beautyTable", nameId: "beautyName", priceId: "beautyPrice", btnId: "addBeautyBtn" },
    { name: "fitness", tableId: "fitnessTable", nameId: "fitnessName", priceId: "fitnessPrice", btnId: "addFitnessBtn" },
    { name: "party", tableId: "partyTable", nameId: "partyName", priceId: "partyPrice", btnId: "addPartyBtn" }
];

function loadAllServices() {
    services.forEach(service => {
        const table = document.getElementById(service.tableId);
        onValue(ref(db, service.name), (snapshot) => {
            table.innerHTML = "";
            snapshot.forEach(child => {
                const data = child.val();
                table.innerHTML += `
                    <tr>
                        <td>${data.name}</td>
                        <td>${data.price}</td>
                        <td><button onclick="deleteItem('${service.name}','${child.key}')">Delete</button></td>
                    </tr>
                `;
            });
        });

        document.getElementById(service.btnId).onclick = () => {
            const name = document.getElementById(service.nameId).value;
            const price = document.getElementById(service.priceId).value;
            if (name && price) {
                push(ref(db, service.name), { name, price });
                document.getElementById(service.nameId).value = "";
                document.getElementById(service.priceId).value = "";
            }
        };
    });
}

window.deleteItem = (serviceName, id) => {
    remove(ref(db, `${serviceName}/${id}`));
};
