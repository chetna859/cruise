document.getElementById('toggleLogins').addEventListener('click', function() {
  const loginButtons = document.querySelectorAll(
    '.admin-login-btn, .manager-login-btn, .headcook-login-btn, .supervisor-login-btn'
  );

  loginButtons.forEach(btn => {
    btn.style.display = btn.style.display === 'none' || btn.style.display === '' 
      ? 'block' 
      : 'none';
  });

});