const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "../login/index.html";
}

document.getElementById("name").innerText = user.name || "(unknown)";
document.getElementById("username").innerText = user.username;
document.getElementById("email").innerText = user.email;
   
