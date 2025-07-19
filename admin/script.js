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
          credentials: "include",
          body: JSON.stringify({ username, password }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        message.style.color = "#388e3c";
        message.textContent = "Login berhasil, mengalihkan...";
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
