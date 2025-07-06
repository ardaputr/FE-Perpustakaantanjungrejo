const tableBody = document.getElementById("historyTableBody");

async function fetchHistory() {
  try {
    const res = await fetch(
      "https://be-perpustakaantanjungrejo.vercel.app/admin/history"
    );
    const data = await res.json();

    tableBody.innerHTML = "";

    data.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><img src="${
          item.link_gambar
        }" alt="cover" style="width:80px;"/></td>
        <td>${item.judul}</td>
        <td>${item.nama_peminjam}</td>
        <td>${item.alamat_peminjam}</td>
        <td>${item.tanggal_peminjaman}</td>
        <td>${item.tanggal_pengembalian || "-"}</td>
        <td>${item.status}</td>
        <td>
          ${
            item.status === "Dipinjam"
              ? `<button onclick="kembalikan(${item.id_peminjaman})">Kembalikan</button>`
              : "-"
          }
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    tableBody.innerHTML =
      '<tr><td colspan="8" style="color:red;">Gagal memuat riwayat.</td></tr>';
  }
}

async function kembalikan(id) {
  if (confirm("Yakin ingin mengembalikan buku ini?")) {
    try {
      const res = await fetch(
        `https://be-perpustakaantanjungrejo.vercel.app/admin/history/${id}`,
        {
          method: "PUT",
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Buku berhasil dikembalikan.");
        fetchHistory();
      } else {
        alert(data.error || "Gagal mengembalikan buku.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan pada server.");
    }
  }
}

fetchHistory();
