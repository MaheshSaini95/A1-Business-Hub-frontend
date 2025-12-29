// js/login.js
const API_URL = "https://a1-business-hub.onrender.com/api";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const loginBtn = document.getElementById("loginBtn");
  loginBtn.disabled = true;
  loginBtn.textContent = "Logging in...";

  try {
    const credentials = {
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
    };

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    // Store auth data
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.user.id);
    localStorage.setItem("userName", data.user.name);

    // Redirect to dashboard
    window.location.href = "dashboard.html";
  } catch (error) {
    alert(error.message);
    loginBtn.disabled = false;
    loginBtn.textContent = "Login";
  }
});
