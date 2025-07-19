const form = document.getElementById("pinjamForm");
const message = document.getElementById("message");
const bookDetailDiv = document.getElementById("bookDetail");

// Fungsi untuk mendapatkan token admin
function getAdminToken() {
  return sessionStorage.getItem("adminToken");
}

// Cek login status
if (!getAdminToken()) {
  window.location.href = "login.html";
}

const urlParams = new URLSearchParams(window.location.search);
const id_buku = urlParams.get("id");

if (!id_buku) {
  message.style.color = "red";
  message.textContent = "ID buku tidak valid";
  form.style.display = "none";
}

// Default tanggal hari ini
document.getElementById("tanggal_pinjam").valueAsDate = new Date();

async function loadBook() {
  const token = getAdminToken();
  try {
    const res = await fetch(
      `https://be-perpustakaantanjungrejo.vercel.app/admin/books/${id_buku}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      if (res.status === 401) {
        sessionStorage.removeItem("adminToken");
        window.location.href = "login.html";
        return;
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    bookDetailDiv.innerHTML = `
      <p><strong>${data.judul || "-"}</strong> oleh ${data.penulis || "-"}<br/>
      Penerbit: ${data.penerbit || "-"}, Tahun: ${data.tahun_terbit || "-"}<br/>
      Stok tersedia: ${data.stok || 0}</p>
    `;

    if (data.stok <= 0) {
      form.style.display = "none";
      message.style.color = "red";
      message.textContent = "❌ Stok habis. Tidak bisa dipinjam.";
    }
  } catch (err) {
    console.error(err);
    bookDetailDiv.innerHTML = `<p style="color:red">${
      err.message || "Gagal memuat data buku"
    }</p>`;
    form.style.display = "none";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = getAdminToken();

  const peminjaman = {
    id_buku,
    nama_peminjam: document.getElementById("nama_peminjam").value.trim(),
    alamat_peminjam: document.getElementById("alamat_peminjam").value.trim(),
    tanggal_peminjaman: document.getElementById("tanggal_pinjam").value,
  };

  // Validasi data
  if (!peminjaman.nama_peminjam) {
    message.style.color = "red";
    message.textContent = "Nama peminjam wajib diisi";
    return;
  }

  if (!peminjaman.alamat_peminjam) {
    message.style.color = "red";
    message.textContent = "Alamat peminjam wajib diisi";
    return;
  }

  try {
    const res = await fetch(
      "https://be-perpustakaantanjungrejo.vercel.app/admin/pinjam",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(peminjaman),
      }
    );

    const data = await res.json();

    if (res.ok) {
      message.style.color = "green";
      message.textContent = "✅ Peminjaman berhasil dicatat!";
      form.reset();

      // Arahkan ke dashboard setelah 1.5 detik
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);
    } else {
      message.style.color = "red";
      message.textContent = data.error || "❌ Gagal meminjam buku";
    }
  } catch (err) {
    console.error(err);
    message.style.color = "red";
    message.textContent = "❌ Terjadi kesalahan pada server";
  }
});

// Panggil fungsi saat halaman dimuat
loadBook();
