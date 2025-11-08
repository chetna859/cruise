const cursorMsg = document.getElementById("cursor-msg");
const serviceItems = document.querySelectorAll(".service-item");
const loginPage = "login.html"; // change to your actual login page

// Show message on hover
serviceItems.forEach(item => {
  item.addEventListener("mouseenter", () => {
    cursorMsg.style.display = "block";
  });

  item.addEventListener("mouseleave", () => {
    cursorMsg.style.display = "none";
  });

  // Redirect to login page when clicked
  item.addEventListener("click", () => {
    window.location.href = loginPage;
  });
});

// Tooltip click → Redirect
cursorMsg.addEventListener("click", () => {
  window.location.href = loginPage;
});

// Move tooltip with cursor
document.addEventListener("mousemove", (e) => {
  cursorMsg.style.left = `${e.pageX + 15}px`;
  cursorMsg.style.top = `${e.pageY + 15}px`;
});
