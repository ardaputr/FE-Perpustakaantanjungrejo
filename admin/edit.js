// edit.js

const hasToken = sessionStorage.getItem("adminToken");
if (!hasToken) {
  window.location.href = "login.html";
  return;
}

// Dan saat ada error 401, tambahkan:
if (res.status === 401 || res.status === 403) {
  sessionStorage.clear();
  window.location.href = "login.html";
  return;
}

const form = document.getElementById("editForm");
const message = document.getElementById("message");

// PROTEKSI SESSION ADMIN
(async function () {
  const res = await fetch(
    "https://be-perpustakaantanjungrejo.vercel.app/admin/books",
    { method: "GET", credentials: "include" }
  );
  if (res.status === 401) {
    window.location.href = "login.html";
    return;
  }
})();

// Ambil ID buku dari URL query ?id=...
const urlParams = new URLSearchParams(window.location.search);
const id_buku = urlParams.get("id");

if (!id_buku) {
  message.style.color = "red";
  message.textContent = "ID buku tidak valid";
  form.style.display = "none";
}

// Ambil data buku dan isi form
async function fetchBook() {
  try {
    const res = await fetch(
      `https://be-perpustakaantanjungrejo.vercel.app/admin/books/${id_buku}`,
      { credentials: "include" }
    );

    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = "login.html";
        return;
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    // Isi form
    document.getElementById("judul").value = data.judul || "";
    document.getElementById("penulis").value = data.penulis || "";
    document.getElementById("penerbit").value = data.penerbit || "";
    document.getElementById("tahun_terbit").value = data.tahun_terbit || "";
    document.getElementById("jumlah_halaman").value = data.jumlah_halaman || "";
    document.getElementById("kategori").value = data.kategori || "";
    document.getElementById("stok").value = data.stok || "";
    document.getElementById("link_gambar").value = data.link_gambar || "";
  } catch (err) {
    console.error(err);
    message.style.color = "red";
    message.textContent = err.message || "Gagal mengambil data buku";
    form.style.display = "none";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dataBuku = {
    judul: document.getElementById("judul").value.trim(),
    penulis: document.getElementById("penulis").value.trim(),
    penerbit: document.getElementById("penerbit").value.trim(),
    tahun_terbit: parseInt(document.getElementById("tahun_terbit").value) || 0,
    jumlah_halaman:
      parseInt(document.getElementById("jumlah_halaman").value) || 0,
    kategori: document.getElementById("kategori").value,
    stok: parseInt(document.getElementById("stok").value) || 0,
    link_gambar: document.getElementById("link_gambar").value.trim(),
  };

  // Validasi data
  if (!dataBuku.judul) {
    message.style.color = "red";
    message.textContent = "Judul buku wajib diisi";
    return;
  }

  try {
    const res = await fetch(
      `https://be-perpustakaantanjungrejo.vercel.app/admin/books/${id_buku}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(dataBuku),
      }
    );

    const data = await res.json();

    if (res.ok) {
      message.style.color = "green";
      message.textContent = "✅ Data buku berhasil diperbarui!";

      // Redirect ke dashboard setelah 1.5 detik
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);
    } else {
      message.style.color = "red";
      message.textContent = data.error || " Gagal memperbarui buku";
    }
  } catch (err) {
    console.error(err);
    message.style.color = "red";
    message.textContent = " Terjadi kesalahan pada server";
  }
});

// Jalankan saat halaman dimuat
fetchBook();
