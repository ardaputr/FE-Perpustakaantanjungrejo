const tableBody = document.getElementById("historyTableBody");

// Fungsi untuk render history
function renderHistory(data) {
  tableBody.innerHTML = "";

  if (!data || !Array.isArray(data) || data.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="error">
          Belum ada riwayat peminjaman.
        </td>
      </tr>
    `;
    return;
  }

  data.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <img src="${item.link_gambar}" alt="cover" class="book-img" 
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjVmNWRjIi8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iIzFhMjM3ZSIvPgo8dGV4dCB4PSIxMDAiIHk9IjExMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCI+8J+TmjwvdGV4dD4KPC9zdmc+'" />
      </td>
      <td>${item.judul || "-"}</td>
      <td>${item.nama_peminjam || "-"}</td>
      <td>${item.alamat_peminjam || "-"}</td>
      <td>${item.tanggal_peminjaman || "-"}</td>
      <td>${item.tanggal_pengembalian || "-"}</td>
      <td>${item.status || "-"}</td>
      <td>
        <div class="action-buttons">
          ${
            item.status === "Dipinjam"
              ? `<button class='btn-kembalikan' onclick='kembalikan(${item.id_peminjaman})'>Kembalikan</button>`
              : "-"
          }
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Fungsi untuk mengembalikan buku
async function kembalikan(id) {
  if (confirm("Yakin ingin mengembalikan buku ini?")) {
    try {
      const res = await fetch(
        `https://be-perpustakaantanjungrejo.vercel.app/admin/history/${id}`,
        {
          method: "PUT",
          credentials: 'include'
        }
      );
      if (res.status === 401 || res.status === 403) {
        window.location.href = '../HomePage.html';
        return;
      }
      const data = await res.json();
      if (res.ok) {
        alert("✅ Buku berhasil dikembalikan.");
        fetchHistory();
      } else {
        alert("❌ " + (data.error || "Gagal mengembalikan buku."));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Terjadi kesalahan pada server.");
    }
  }
}

// Panggil fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", fetchHistory);
