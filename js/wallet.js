// js/wallet.js
const API_URL = "https://a1-business-hub.onrender.com/api";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.clear();
    window.location.href = "login.html";
  }
}

async function loadWalletBalance() {
  try {
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load wallet balance");
    }

    const data = await response.json();
    console.log("Wallet data:", data);

    // ✅ FIX: Use correct property name
    const balance = data.user?.walletBalance || "0.00";
    document.getElementById("walletBalance").textContent = balance;
  } catch (error) {
    console.error("Error loading balance:", error);
    document.getElementById("walletBalance").textContent = "0.00";
  }
}

async function loadWithdrawalHistory() {
  try {
    const response = await fetch(`${API_URL}/withdrawal/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load withdrawal history");
    }

    const data = await response.json();
    console.log("Withdrawal history:", data);

    if (!data.withdrawals || data.withdrawals.length === 0) {
      document.getElementById("withdrawalHistory").innerHTML =
        '<p style="text-align: center; color: #718096; padding: 2rem;">No withdrawals yet</p>';
      return;
    }

    let html =
      '<table class="data-table"><thead><tr><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>';
    data.withdrawals.forEach((w) => {
      const statusClass =
        w.status === "approved"
          ? "success"
          : w.status === "rejected"
          ? "error"
          : "warning";
      html += `<tr>
                <td>${new Date(w.created_at).toLocaleDateString("en-IN")}</td>
                <td>₹${parseFloat(w.amount).toFixed(2)}</td>
                <td><span class="badge ${statusClass}">${w.status}</span></td>
            </tr>`;
    });
    html += "</tbody></table>";
    document.getElementById("withdrawalHistory").innerHTML = html;
  } catch (error) {
    console.error("Error loading history:", error);
    document.getElementById("withdrawalHistory").innerHTML =
      '<p style="text-align: center; color: #f56565;">Failed to load withdrawal history</p>';
  }
}

document
  .getElementById("withdrawalForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const amount = parseFloat(document.getElementById("amount").value);
    const walletBalance = parseFloat(
      document.getElementById("walletBalance").textContent
    );

    console.log("Withdrawal request:", { amount, walletBalance });

    if (amount > walletBalance) {
      alert("Insufficient balance");
      return;
    }

    if (amount < 500) {
      alert("Minimum withdrawal amount is ₹500");
      return;
    }

    const bankDetails = {
      accountHolder: document.getElementById("accountHolder").value,
      accountNumber: document.getElementById("accountNumber").value,
      ifsc: document.getElementById("ifsc").value,
      bankName: document.getElementById("bankName").value,
    };

    try {
      const response = await fetch(`${API_URL}/withdrawal/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, bankDetails }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      alert("✅ Withdrawal request submitted successfully!");
      document.getElementById("withdrawalForm").reset();
      loadWalletBalance();
      loadWithdrawalHistory();
    } catch (error) {
      alert("❌ Error: " + error.message);
    }
  });

// Load data on page load
loadWalletBalance();
loadWithdrawalHistory();
