const tableBody = document.getElementById("historyTableBody");

async function requireAdminSession() {
  const res = await fetch(
    "https://be-perpustakaantanjungrejo.vercel.app/admin/history",
    { method: "GET", credentials: "include" }
  );
  if (res.status === 401 || res.status === 403) {
    window.location.href = "login.html";
    throw new Error("Unauthorized");
  }
  return res.json();
}

async function fetchHistory() {
  try {
    const data = await requireAdminSession();
    renderHistory(data);
  } catch (err) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="error">
          Gagal mengambil riwayat peminjaman. Silakan login ulang.
        </td>
      </tr>
    `;
  }
}

async function kembalikan(id) {
  if (confirm("Yakin ingin mengembalikan buku ini?")) {
    try {
      const res = await fetch(
        `https://be-perpustakaantanjungrejo.vercel.app/admin/history/${id}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );
      if (res.status === 401 || res.status === 403) {
        window.location.href = "login.html";
        return;
      }
      const data = await res.json();
      if (res.ok) {
        alert("Buku berhasil dikembalikan.");
        fetchHistory();
      } else {
        alert("❌ " + (data.error || "Gagal mengembalikan buku."));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan pada server.");
    }
  }
}

document.addEventListener("DOMContentLoaded", fetchHistory);
