// js/register.js
const API_URL = "https://a1-business-hub.onrender.com/api";

// Get referral code from URL
const urlParams = new URLSearchParams(window.location.search);
const refCode = urlParams.get("ref");
if (refCode) {
  document.getElementById("referralCode").value = refCode;
}

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const registerBtn = document.getElementById("registerBtn");
    registerBtn.disabled = true;
    registerBtn.textContent = "Processing...";

    try {
      const formData = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        password: document.getElementById("password").value,
        referralCode: document.getElementById("referralCode").value.trim(),
      };

      console.log("Submitting registration:", formData);

      // Register user
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (!response.ok) {
        throw new Error(data.error || data.details || "Registration failed");
      }

      // Store token
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userName", data.user.name);

      // Show payment notification
      showPaymentNotification(data.token);
    } catch (error) {
      console.error("Registration error:", error);
      alert("❌ " + error.message);
      registerBtn.disabled = false;
      registerBtn.textContent = "Register Now";
    }
  });

// Show payment notification modal
function showPaymentNotification(token) {
  const modal = document.createElement("div");
  modal.className = "payment-modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h2>✅ Registration Successful!</h2>
      <p class="modal-message">
        Your account has been created!<br>
        <strong>To activate and get your referral code,</strong><br>
        complete the joining fee of <strong>₹250</strong>.
      </p>
      <div class="modal-benefits">
        <p>✨ Benefits after payment:</p>
        <ul>
          <li>✅ ₹50 instant welcome bonus</li>
          <li>✅ Unique referral code</li>
          <li>✅ Start earning commissions</li>
          <li>✅ Build your team</li>
        </ul>
      </div>
      <div class="modal-buttons">
        <button onclick="initiatePayment('${token}')" class="btn-primary">
          Pay ₹250 Now
        </button>
        <button onclick="payLater()" class="btn-secondary">
          Pay Later
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Initiate payment
async function initiatePayment(token) {
  try {
    document.querySelector(".modal-buttons .btn-primary").textContent =
      "Creating order...";

    // Create order
    const response = await fetch(`${API_URL}/payment/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create order");
    }

    // Load Cashfree
    const cashfree = await loadCashfree();

    const checkoutOptions = {
      paymentSessionId: data.paymentSessionId,
      returnUrl: `http://localhost:5500/vk-marketing-frontend/payment-success.html?order_id=${data.orderId}`,
      redirectTarget: "_self",
    };

    cashfree.checkout(checkoutOptions);
  } catch (error) {
    alert("❌ " + error.message);
    document.querySelector(".modal-buttons .btn-primary").textContent =
      "Pay ₹250 Now";
  }
}

// Load Cashfree SDK
async function loadCashfree() {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => {
      const cashfree = Cashfree({ mode: "sandbox" });
      resolve(cashfree);
    };
    document.head.appendChild(script);
  });
}

// Pay later
function payLater() {
  alert("You can pay anytime from your dashboard!");
  window.location.href = "login.html";
}
