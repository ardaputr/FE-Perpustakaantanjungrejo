form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch(
      "https://be-perpustakaantanjungrejo.vercel.app/admin/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      // Simpan token dan data admin
      sessionStorage.setItem("adminToken", data.token || data.admin?.username);
      sessionStorage.setItem("adminData", JSON.stringify(data.admin || {}));

      // redirect ke dashboard
      window.location.href = "dashboard.html";
    } else {
      throw new Error(data.error || "Login gagal");
    }
  } catch (err) {
    message.style.color = "red";
    message.textContent = err.message;
  }
});
