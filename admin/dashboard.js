const tableBody = document.getElementById("booksTableBody");

function logout() {
  if (confirm("Yakin ingin logout?")) {
    // Hapus session/token jika ada
    localStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminToken");

    // Redirect ke halaman login
    window.location.href = "HomePage.html";
  }
}

async function fetchBooks() {
  try {
    const res = await fetch(
      "https://be-perpustakaantanjungrejo.vercel.app/admin/books",
      {
        method: "GET",
        credentials: "include",
      }
    );
    const data = await res.json();

    tableBody.innerHTML = "";

    data.forEach((buku) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td><img src="${buku.link_gambar}" alt="cover" style="width:80px;"/></td>
        <td>${buku.judul}</td>
        <td>${buku.penulis}</td>
        <td>${buku.penerbit}</td>
        <td>${buku.tahun_terbit}</td>
        <td>${buku.stok}</td>
        <td>
          <button onclick="window.location.href='edit.html?id=${buku.id_buku}'">Edit</button>
          <button onclick="hapusBuku(${buku.id_buku})">Hapus</button>
          <button onclick="window.location.href='pinjam.html?id=${buku.id_buku}'">Pinjam</button>
        </td>
      `;

      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Gagal mengambil data buku:", err);
    tableBody.innerHTML =
      '<tr><td colspan="7">Gagal mengambil data buku.</td></tr>';
  }
}

async function hapusBuku(id) {
  if (confirm("Apakah anda yakin ingin menghapus buku ini?")) {
    try {
      const res = await fetch(
        `https://be-perpustakaantanjungrejo.vercel.app/admin/books/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();

      if (res.ok) {
        alert("Buku berhasil dihapus.");
        fetchBooks(); // refresh tabel
      } else {
        alert(data.error || "Gagal menghapus buku.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan pada server.");
    }
  }
}

fetchBooks();
