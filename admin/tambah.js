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

// Ambil semua data buku saat halaman dimuat
async function fetchBooks() {
  try {
    const res = await fetch("https://be-perpustakaantanjungrejo.vercel.app/admin/books");
    const data = await res.json();
    if (res.ok) {
      allBooks = data;
    } else {
      console.error("Gagal memuat data buku");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

// Isi otomatis jika judul sudah ada
inputJudul.addEventListener("input", () => {
  const inputValue = inputJudul.value.trim().toLowerCase();
  const match = allBooks.find(book => book.judul.toLowerCase() === inputValue);

  if (match) {
    inputPenulis.value = match.penulis;
    inputPenerbit.value = match.penerbit;
    inputTahun.value = match.tahun_terbit;
    inputHalaman.value = match.jumlah_halaman;
    inputKategori.value = match.kategori;
    inputGambar.value = match.link_gambar || '';
    message.style.color = "orange";
    message.textContent = "Judul sudah ada. Anda hanya dapat menambah stok.";
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

  // Cek apakah buku sudah ada berdasarkan judul
  const existingBook = allBooks.find(
    book => book.judul.toLowerCase() === dataBuku.judul.toLowerCase()
  );

  if (existingBook) {
    // Jika ada → tampilkan pesan error, tidak boleh tambah stok dari sini
    message.style.color = "red";
    message.textContent = "Judul sudah ada. Silakan edit buku dari dashboard untuk menambah stok.";
    return;
  } else {
    // Jika tidak ada → tambah buku baru
    try {
      const res = await fetch("https://be-perpustakaantanjungrejo.vercel.app/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataBuku),
      });

      const result = await res.json();
      if (res.ok) {
        message.style.color = "green";
        message.textContent = "Buku berhasil ditambahkan!";
        form.reset();
        await fetchBooks(); // refresh data
      } else {
        message.style.color = "red";
        message.textContent = result.error || "Gagal menambah buku.";
      }
    } catch (err) {
      console.error(err);
      message.style.color = "red";
      message.textContent = "Terjadi kesalahan pada server.";
    }
  }
});

// Jalankan saat halaman dimuat
fetchBooks();
