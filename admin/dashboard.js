const tableBody = document.getElementById("booksTableBody");
let allBooks = [];

// Fungsi untuk mendapatkan token admin
function getAdminToken() {
  return sessionStorage.getItem("adminToken");
}

// Fungsi untuk logout
function logout() {
  if (confirm("Yakin ingin logout?")) {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminData");
    window.location.href = "../HomePage.html";
  }
}

// Fungsi untuk fetch data buku dengan autentikasi
async function fetchBooks() {
  const token = getAdminToken();
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(
      "https://be-perpustakaantanjungrejo.vercel.app/admin/books",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      if (res.status === 401) {
        // Token tidak valid, redirect ke login
        sessionStorage.removeItem("adminToken");
        window.location.href = "login.html";
        return;
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    // Pastikan data adalah array
    if (!Array.isArray(data)) {
      throw new Error("Data buku yang diterima bukan array");
    }

    allBooks = data;
    renderBooks(allBooks);
    updateStats(allBooks);

    // Panggil fetchKategori setelah data buku berhasil diambil
    await fetchKategori();
  } catch (err) {
    console.error("Gagal mengambil data buku:", err);
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="error">
          ❌ Gagal mengambil data buku: ${err.message}
        </td>
      </tr>
    `;
  }
}

// Fungsi untuk mengambil kategori (dengan fallback)
async function fetchKategori() {
  const token = getAdminToken();

  // Coba ambil dari endpoint khusus kategori
  try {
    const res = await fetch(
      "https://be-perpustakaantanjungrejo.vercel.app/admin/categories",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        kategoriList = data.map((kat) => kat.nama_kategori);
        renderKategoriDropdown();
        return;
      }
    }
  } catch (err) {
    console.log("Gagal mengambil kategori dari endpoint, menggunakan fallback");
  }

  // Fallback: generate kategori dari data buku
  if (Array.isArray(allBooks)) {
    kategoriList = [...new Set(allBooks.map((b) => b.kategori))].filter(
      Boolean
    );
    renderKategoriDropdown();
  }
}

// Fungsi untuk render dropdown kategori
function renderKategoriDropdown() {
  const select = document.getElementById("kategoriSelect");
  if (!select) return;

  select.innerHTML = '<option value="">Semua Kategori</option>';

  // Urutkan kategori
  const sortedKategori = [...kategoriList].sort((a, b) =>
    a.localeCompare(b, "id", { sensitivity: "base" })
  );

  sortedKategori.forEach((kat) => {
    const opt = document.createElement("option");
    opt.value = kat;
    opt.textContent = kat;
    select.appendChild(opt);
  });
}

// Fungsi untuk render buku
function renderBooks(books) {
  tableBody.innerHTML = "";

  if (!books || books.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="error">
          Belum ada data buku.
        </td>
      </tr>
    `;
    return;
  }

  books.forEach((buku) => {
    const row = document.createElement("tr");
    const stockClass =
      buku.stok > 0 ? "" : 'style="color: #dc2626; font-weight: 600;"';
    const stockText = buku.stok > 0 ? buku.stok : "Habis";

    row.innerHTML = `
      <td>
        <img src="${buku.link_gambar || ""}" alt="cover" class="book-img" 
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjVmNWRjIi8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iIzFhMjM3ZSIvPgo8dGV4dCB4PSIxMDAiIHk9IjExMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCI+8J+TmjwvdGV4dD4KPC9zdmc+'" />
      </td>
      <td class="book-title">${buku.judul || "-"}</td>
      <td>${buku.penulis || "-"}</td>
      <td>${buku.penerbit || "-"}</td>
      <td>${buku.tahun_terbit || "-"}</td>
      <td ${stockClass}>${stockText}</td>
      <td>
        <div class="action-buttons">
          <button onclick="window.location.href='edit.html?id=${
            buku.id_buku
          }'" class="btn-edit">
            ✏️ Edit
          </button>
          <button onclick="hapusBuku(${buku.id_buku})" class="btn-delete">
            🗑️ Hapus
          </button>
          <button onclick="window.location.href='pinjam.html?id=${
            buku.id_buku
          }'" class="btn-pinjam" ${buku.stok === 0 ? "disabled" : ""}>
            📖 Pinjam
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Panggil fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  // Cek apakah user sudah login
  if (!getAdminToken()) {
    window.location.href = "login.html";
    return;
  }

  fetchBooks();

  // Event listener untuk search input
  document.getElementById("searchInput").addEventListener("input", function () {
    const searchValue = this.value.trim().toLowerCase();
    let filteredBooks = allBooks;

    if (searchValue) {
      filteredBooks = allBooks.filter(
        (book) =>
          (book.judul && book.judul.toLowerCase().includes(searchValue)) ||
          (book.penulis && book.penulis.toLowerCase().includes(searchValue)) ||
          (book.penerbit && book.penerbit.toLowerCase().includes(searchValue))
      );
    }

    renderBooks(filteredBooks);
    updateStats(filteredBooks);
  });
});
