const hasToken = sessionStorage.getItem("adminToken");
if (!hasToken) {
  window.location.href = "login.html";
  return;
}

// Dan saat ada error 401, tambahkan:
if (res.status === 401 || res.status === 403) {
  sessionStorage.clear();
  window.location.href = "login.html";
  return;
}

document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("message");
    message.style.color = "#c62828";
    message.textContent = "";

    if (!username || !password) {
      message.textContent = "Username dan password wajib diisi.";
      return;
    }

    try {
      const res = await fetch(
        "https://be-perpustakaantanjungrejo.vercel.app/admin/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Penting untuk session-based auth
          body: JSON.stringify({ username, password }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        message.style.color = "#388e3c";
        message.textContent = "Login berhasil, mengalihkan...";

        // Simpan juga ke sessionStorage sebagai backup
        if (data.token) {
          sessionStorage.setItem("adminToken", data.token);
        }
        if (data.admin) {
          sessionStorage.setItem("adminData", JSON.stringify(data.admin));
        }

        // Tunggu sebentar agar session tersimpan di backend
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 800);
      } else {
        message.textContent = data.error || "Login gagal.";
      }
    } catch (err) {
      console.error("Login error:", err);
      message.textContent = "Terjadi kesalahan koneksi.";
    }
  });
