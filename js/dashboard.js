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

async function loadDashboard() {
  try {
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

    document.getElementById("userName").textContent = user.name;
    document.getElementById("referralCode").textContent =
      user.referralCode || "PENDING";

    // Show payment alert if inactive
    if (!user.isActive) {
      document.getElementById("paymentAlert").style.display = "block";
    }

    // Load stats
    const statsRes = await fetch(`${API_URL}/user/dashboard-stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const statsData = await statsRes.json();
    const stats = statsData.stats;

    document.getElementById("walletBalance").textContent = stats.walletBalance;
    document.getElementById("totalEarnings").textContent = stats.totalEarnings;
    document.getElementById("directReferrals").textContent =
      stats.directReferrals;
    document.getElementById("totalTeam").textContent = stats.totalTeam;

    // Load commissions
    const commissionsRes = await fetch(`${API_URL}/user/commissions`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const commissionsData = await commissionsRes.json();
    const commissions = commissionsData.commissions || [];

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
  } catch (error) {
    console.error("Dashboard error:", error);
    alert("Failed to load dashboard. Please try again.");
  }
}

function copyReferralCode() {
  const code = document.getElementById("referralCode").textContent;
  if (code === "PENDING" || code === "---") {
    alert("Complete payment to get your referral code");
    return;
  }

  navigator.clipboard.writeText(code).then(() => {
    const elem = document.getElementById("referralCode");
    const originalText = elem.textContent;
    elem.textContent = "✓ Copied!";
    elem.style.color = "#48bb78";
    setTimeout(() => {
      elem.textContent = originalText;
      elem.style.color = "";
    }, 2000);
  });
}

loadDashboard();
