const tableBody = document.getElementById("booksTableBody");
let allBooks = [];
let kategoriList = [];

async function checkSession(retryCount = 0) {
  try {
    const res = await fetch(
      "https://be-perpustakaantanjungrejo.vercel.app/admin/books",
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
        },
      }
    );

    if (res.status === 401) {
      if (retryCount < 2) {
        console.log(`Session check failed, retrying... (${retryCount + 1}/2)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return checkSession(retryCount + 1);
      }

      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminData");
      window.location.href = "login.html";
      return false;
    }

    return res.ok;
  } catch (err) {
    console.error("Session check error:", err);
    if (retryCount < 2) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return checkSession(retryCount + 1);
    }
    window.location.href = "login.html";
    return false;
  }
}

(async function () {
  const hasToken = sessionStorage.getItem("adminToken");
  if (!hasToken) {
    window.location.href = "login.html";
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  const sessionValid = await checkSession();
  if (!sessionValid) {
    return;
  }
})();

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

    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminData");
    window.location.href = "../HomePage.html";
  }
}

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

async function fetchKategori() {
  try {
    const res = await fetch(
      "https://be-perpustakaantanjungrejo.vercel.app/admin/categories",
      { credentials: "include" }
    );
    if (res.status === 401 || res.status === 403) {
      sessionStorage.clear();
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

async function fetchBooks() {
  try {
    const res = await fetch(
      "https://be-perpustakaantanjungrejo.vercel.app/admin/books",
      { method: "GET", credentials: "include" }
    );
    if (res.status === 401 || res.status === 403) {
      sessionStorage.clear();
      window.location.href = "login.html";
      return;
    }
    const data = await res.json();
    allBooks = data;
    await fetchKategori();
    renderBooks(allBooks);
    updateStats(allBooks);
  } catch (err) {
    console.error("Gagal mengambil data buku:", err);
    tableBody.innerHTML =
      '<tr><td colspan="7" class="error">❌ Gagal mengambil data buku. Silakan coba lagi nanti.</td></tr>';
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
      if (res.status === 401 || res.status === 403) {
        sessionStorage.clear();
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

// Fungsi untuk handle pencarian
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

document.getElementById("searchInput")?.addEventListener("input", handleSearch);

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    fetchBooks();
  }, 300);
});
