// js/referral.js
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

async function loadReferralLink() {
  try {
    const response = await fetch(`${API_URL}/referral/link`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load referral link");
    }

    const data = await response.json();

    document.getElementById("refCode").textContent = data.referralCode || "N/A";
    document.getElementById("referralLink").value = data.referralLink || "";
  } catch (error) {
    console.error("Error loading referral link:", error);
    document.getElementById("refCode").textContent = "Error loading";
  }
}

function copyLink() {
  const input = document.getElementById("referralLink");
  input.select();
  document.execCommand("copy");

  // Show feedback
  const btn = event.target;
  const originalText = btn.textContent;
  btn.textContent = "✓ Copied!";
  btn.style.background = "#48bb78";

  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = "";
  }, 2000);
}

function shareLink() {
  const link = document.getElementById("referralLink").value;
  if (!link) {
    alert("Referral link not available yet");
    return;
  }
  const message = encodeURIComponent(
    `🚀 Join me on MLM Platform and start earning!\n\nUse my referral link:\n${link}\n\nGet ₹50 welcome bonus instantly!`
  );
  window.open(`https://wa.me/?text=${message}`, "_blank");
}

async function loadTeam(level = "all") {
  try {
    const url =
      level === "all"
        ? `${API_URL}/referral/team`
        : `${API_URL}/referral/team?level=${level}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load team");
    }

    const data = await response.json();
    console.log("Team data:", data);

    // ✅ FIX: Safely check array
    if (!data.team || data.team.length === 0) {
      document.getElementById("teamList").innerHTML =
        '<p style="text-align: center; color: #718096; padding: 2rem;">No team members yet. Start referring to build your team! 🚀</p>';
      return;
    }

    let html =
      '<div style="overflow-x: auto;"><table class="data-table"><thead><tr><th>Name</th><th>Level</th><th>Phone</th><th>Status</th><th>Joined</th></tr></thead><tbody>';
    data.team.forEach((member) => {
      const user = member.user || {};
      const status = user.is_active
        ? '<span style="color: #48bb78;">✅ Active</span>'
        : '<span style="color: #f56565;">❌ Inactive</span>';
      html += `<tr>
                <td>${user.name || "N/A"}</td>
                <td><strong>Level ${member.level}</strong></td>
                <td>${user.phone || "N/A"}</td>
                <td>${status}</td>
                <td>${
                  user.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-IN")
                    : "N/A"
                }</td>
            </tr>`;
    });
    html += "</tbody></table></div>";
    document.getElementById("teamList").innerHTML = html;
  } catch (error) {
    console.error("Error loading team:", error);
    document.getElementById("teamList").innerHTML =
      '<p style="text-align: center; color: #f56565; padding: 2rem;">Failed to load team data. Please try again.</p>';
  }
}

// Update active tab
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    this.classList.add("active");
  });
});

loadReferralLink();
loadTeam("all");
