// js/dashboard.js
const API_URL = "https://a1-business-hub.onrender.com/api";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

function toggleMenu() {
  document.getElementById("navMenu").classList.toggle("active");
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.clear();
    window.location.href = "login.html";
  }
}

// ✅ Check user payment status
async function checkPaymentStatus() {
  try {
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Session expired");
    }

    const userData = await response.json();
    console.log("👤 User data:", userData);

    // ✅ If payment not complete, redirect
    if (!userData.user.is_active) {
      console.log("⚠️ Payment not completed, redirecting...");
      window.location.href = "payment-pending.html";
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Status check error:", error);
    localStorage.clear();
    window.location.href = "login.html";
    return false;
  }
}

async function loadDashboard() {
  try {
    // ✅ First check payment status
    const isActive = await checkPaymentStatus();
    if (!isActive) return;

    // Load profile
    const profileRes = await fetch(`${API_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!profileRes.ok) throw new Error("Failed to load profile");

    const profileData = await profileRes.json();
    const user = profileData.user;

    console.log("✅ Profile loaded:", user);

    // Update UI
    document.getElementById("userName").textContent = user.name || "User";
    document.getElementById("referralCode").textContent =
      user.referral_code || "PENDING";

    // Show payment alert if inactive (shouldn't reach here due to redirect)
    if (!user.is_active) {
      document.getElementById("paymentAlert").style.display = "block";
    }

    // Load stats
    const statsRes = await fetch(`${API_URL}/user/dashboard-stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!statsRes.ok) throw new Error("Failed to load stats");

    const statsData = await statsRes.json();
    const stats = statsData.stats;

    console.log("📊 Stats loaded:", stats);

    // Update stats display
    document.getElementById("walletBalance").textContent = parseFloat(
      stats.walletBalance || 0
    ).toFixed(2);
    document.getElementById("totalEarnings").textContent = parseFloat(
      stats.totalEarnings || 0
    ).toFixed(2);
    document.getElementById("directReferrals").textContent =
      stats.directReferrals || 0;
    document.getElementById("totalTeam").textContent = stats.totalTeam || 0;

    // Load commissions
    const commissionsRes = await fetch(`${API_URL}/user/commissions`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!commissionsRes.ok) throw new Error("Failed to load commissions");

    const commissionsData = await commissionsRes.json();
    const commissions = commissionsData.commissions || [];

    console.log("💰 Commissions loaded:", commissions.length);

    // Display commissions
    if (commissions.length === 0) {
      document.getElementById("commissionsList").innerHTML =
        '<p style="text-align: center; color: #718096; padding: 2rem;">No commissions yet. Start referring! 💰</p>';
    } else {
      let html =
        '<div class="table-responsive"><table class="data-table"><thead><tr><th>Date</th><th>From</th><th>Level</th><th>Amount</th></tr></thead><tbody>';

      commissions.slice(0, 10).forEach((c) => {
        const date = new Date(c.created_at).toLocaleDateString("en-IN");
        const fromUser = c.source_user?.name || "Unknown";
        html += `<tr>
          <td>${date}</td>
          <td>${fromUser}</td>
          <td><span class="level-badge">L${c.level}</span></td>
          <td class="amount-cell">₹${parseFloat(c.amount).toFixed(2)}</td>
        </tr>`;
      });

      html += "</tbody></table></div>";
      document.getElementById("commissionsList").innerHTML = html;
    }

    console.log("✅ Dashboard loaded successfully");
  } catch (error) {
    console.error("❌ Dashboard error:", error);
    alert("Failed to load dashboard: " + error.message);
  }
}

function copyReferralCode() {
  const code = document.getElementById("referralCode").textContent;

  if (code === "PENDING" || code === "---") {
    alert("Complete payment to get your referral code");
    return;
  }

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        const elem = document.getElementById("referralCode");
        const originalText = elem.textContent;
        const originalColor = elem.style.color;

        elem.textContent = "✓ Copied!";
        elem.style.color = "#48bb78";

        setTimeout(() => {
          elem.textContent = originalText;
          elem.style.color = originalColor;
        }, 2000);
      })
      .catch((err) => {
        alert("Referral code: " + code);
      });
  } else {
    alert("Referral code: " + code + "\n\nCopy manually.");
  }
}

// Start loading dashboard
loadDashboard();
