// tambah.js

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

const form = document.getElementById("tambahForm");
const message = document.getElementById("message");

const inputJudul = document.getElementById("judul");
const inputPenulis = document.getElementById("penulis");
const inputPenerbit = document.getElementById("penerbit");
const inputTahun = document.getElementById("tahun_terbit");
const inputHalaman = document.getElementById("jumlah_halaman");
const inputKategori = document.getElementById("kategori");
const inputStok = document.getElementById("stok");
const inputGambar = document.getElementById("link_gambar");

let allBooks = [];

// Proteksi session admin
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

// Ambil semua data buku
async function fetchBooks() {
  try {
    const res = await fetch(
      "https://be-perpustakaantanjungrejo.vercel.app/admin/books",
      { method: "GET", credentials: "include" }
    );
    if (res.status === 401 || res.status === 403) {
      window.location.href = "login.html";
      return;
    }
    const data = await res.json();
    allBooks = data;
  } catch (err) {
    console.error("Error:", err);
    message.style.color = "red";
    message.textContent = "Gagal memuat data buku. Silakan refresh halaman.";
  }
}

// Isi otomatis jika judul sudah ada
inputJudul.addEventListener("input", () => {
  const inputValue = inputJudul.value.trim().toLowerCase();
  const match = allBooks.find(
    (book) => book.judul && book.judul.toLowerCase() === inputValue
  );

  if (match) {
    inputPenulis.value = match.penulis || "";
    inputPenerbit.value = match.penerbit || "";
    inputTahun.value = match.tahun_terbit || "";
    inputHalaman.value = match.jumlah_halaman || "";
    inputKategori.value = match.kategori || "";
    inputGambar.value = match.link_gambar || "";
    message.style.color = "orange";
    message.textContent = "⚠️ Judul sudah ada. Anda hanya dapat menambah stok.";
  } else {
    inputPenulis.value = "";
    inputPenerbit.value = "";
    inputTahun.value = "";
    inputHalaman.value = "";
    inputKategori.value = "";
    inputGambar.value = "";
    message.textContent = "";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dataBuku = {
    judul: inputJudul.value.trim(),
    penulis: inputPenulis.value.trim(),
    penerbit: inputPenerbit.value.trim(),
    tahun_terbit: parseInt(inputTahun.value) || 0,
    jumlah_halaman: parseInt(inputHalaman.value) || 0,
    kategori: inputKategori.value,
    stok: parseInt(inputStok.value) || 0,
    link_gambar: inputGambar.value.trim(),
  };

  // Validasi data
  if (!dataBuku.judul) {
    message.style.color = "red";
    message.textContent = "❌ Judul buku wajib diisi";
    return;
  }

  if (dataBuku.stok < 0) {
    message.style.color = "red";
    message.textContent = "❌ Stok tidak boleh negatif";
    return;
  }

  // Cek apakah buku sudah ada berdasarkan judul
  const existingBook = allBooks.find(
    (book) =>
      book.judul && book.judul.toLowerCase() === dataBuku.judul.toLowerCase()
  );

  if (existingBook) {
    message.style.color = "red";
    message.textContent =
      "❌ Judul sudah ada. Silakan edit buku dari dashboard untuk menambah stok.";
    return;
  }

  try {
    const res = await fetch(
      "https://be-perpustakaantanjungrejo.vercel.app/admin/books",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(dataBuku),
      }
    );
    if (res.status === 401 || res.status === 403) {
      window.location.href = "login.html";
      return;
    }

    const result = await res.json();

    if (res.ok) {
      message.style.color = "green";
      message.textContent = "✅ Buku berhasil ditambahkan!";
      form.reset();
      await fetchBooks(); // refresh data

      // Redirect ke dashboard setelah 2 detik
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 2000);
    } else {
      message.style.color = "red";
      message.textContent = result.error || "❌ Gagal menambah buku";
    }
  } catch (err) {
    console.error(err);
    message.style.color = "red";
    message.textContent = "❌ Terjadi kesalahan pada server";
  }
});

// Jalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", fetchBooks);
