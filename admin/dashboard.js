const tableBody = document.getElementById("booksTableBody");
let allBooks = [];
let kategoriList = [];

// Proteksi session admin dengan cek langsung ke backend
async function requireAdminSession() {
  const res = await fetch(
    "https://be-perpustakaantanjungrejo.vercel.app/admin/books",
    { method: "GET", credentials: "include" }
  );
  if (res.status === 401 || res.status === 403) {
    window.location.href = "login.html";
    throw new Error("Unauthorized");
  }
  return res.json();
}

// Logout
async function logout() {
  if (confirm("Yakin ingin logout?")) {
    try {
      await fetch(
        "https://be-perpustakaantanjungrejo.vercel.app/admin/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (err) {
      console.error("Logout error:", err);
    }
    window.location.href = "../HomePage.html";
  }
}

// Statistik buku
function updateStats(books = allBooks) {
  const totalBooks = books.length;
  const availableBooks = books.filter((book) => book.stok > 0).length;
  const outOfStock = books.filter((book) => book.stok === 0).length;
  const totalStock = books.reduce((sum, book) => sum + parseInt(book.stok), 0);

  document.getElementById("totalBooks").textContent = totalBooks;
  document.getElementById("availableBooks").textContent = availableBooks;
  document.getElementById("outOfStock").textContent = outOfStock;
  document.getElementById("totalStock").textContent = totalStock;
}

// Render tabel buku
function renderBooks(books) {
  tableBody.innerHTML = "";
  if (!books || books.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="7" class="error">Belum ada data buku.</td></tr>';
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
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjVmNWRjIi8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iIzFhMjM3ZSIvPgo8dGV4dCB4PSIxMDAiIHk9IjExMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCI+8J+TmjwvdGV4dD4KPC9zdmc='" />
      </td>
      <td class="book-title">${buku.judul ? buku.judul : "-"}</td>
      <td>${buku.penulis ? buku.penulis : "-"}</td>
      <td>${buku.penerbit ? buku.penerbit : "-"}</td>
      <td>${buku.tahun_terbit ? buku.tahun_terbit : "-"}</td>
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

// Fetch kategori (jika ada)
async function fetchKategori() {
  try {
    const res = await fetch(
      "https://be-perpustakaantanjungrejo.vercel.app/admin/categories",
      { credentials: "include" }
    );
    if (res.status === 401 || res.status === 403) {
      window.location.href = "login.html";
      return;
    }
    if (!res.ok) throw new Error("No endpoint");
    const data = await res.json();
    kategoriList = data.map((kat) => kat.nama_kategori);
  } catch (err) {
    kategoriList = [...new Set(allBooks.map((b) => b.kategori))].filter(
      Boolean
    );
  }
}

// Fetch buku
async function fetchBooks() {
  try {
    allBooks = await requireAdminSession(); // Sekaligus proteksi session
    await fetchKategori();
    renderBooks(allBooks);
    updateStats(allBooks);
  } catch (err) {
    tableBody.innerHTML =
      '<tr><td colspan="7" class="error"> Gagal mengambil data buku. Silakan login ulang.</td></tr>';
  }
}

// Hapus buku
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
      if (res.status === 401 || res.status === 403) {
        window.location.href = "login.html";
        return;
      }
      const data = await res.json();
      if (res.ok) {
        alert("Buku berhasil dihapus.");
        fetchBooks();
      } else {
        alert("❌ " + (data.error || "Gagal menghapus buku."));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan pada server.");
    }
  }
}

// Pencarian buku
function handleSearch() {
  const searchValue = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();
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
}

// Event
document.getElementById("searchInput")?.addEventListener("input", handleSearch);
document.getElementById("logoutBtn")?.addEventListener("click", logout);

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    fetchBooks();
  }, 300);
});

window.hapusBuku = hapusBuku;
