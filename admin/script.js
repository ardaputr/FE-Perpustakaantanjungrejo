const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch(
      "https://be-perpustakaantanjungrejo.vercel.app/admin/login",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      message.style.color = "green";
      message.textContent = data.message;

      // redirect ke dashboard
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    } else {
      message.style.color = "red";
      message.textContent = data.error;
    }
  } catch (err) {
    console.error(err);
    message.style.color = "red";
    message.textContent = "Terjadi kesalahan pada server.";
  }
});
