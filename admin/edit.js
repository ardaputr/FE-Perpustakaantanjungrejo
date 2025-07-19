const form = document.getElementById("editForm");
const message = document.getElementById("message");

// Ambil ID buku dari URL query ?id=...
const urlParams = new URLSearchParams(window.location.search);
const id_buku = urlParams.get("id");

async function fetchBook() {
  try {
    const res = await fetch(
      `https://be-perpustakaantanjungrejo.vercel.app/admin/books/${id_buku}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Gagal mengambil data buku.");
    }

    // Isi form
    document.getElementById("judul").value = data.judul;
    document.getElementById("penulis").value = data.penulis;
    document.getElementById("penerbit").value = data.penerbit;
    document.getElementById("tahun_terbit").value = data.tahun_terbit;
    document.getElementById("jumlah_halaman").value = data.jumlah_halaman;
    document.getElementById("kategori").value = data.kategori;
    document.getElementById("stok").value = data.stok;
    document.getElementById("link_gambar").value = data.link_gambar;
  } catch (err) {
    console.error(err);
    message.style.color = "red";
    message.textContent = err.message;
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

  try {
    const res = await fetch(
      `https://be-perpustakaantanjungrejo.vercel.app/admin/books/${id_buku}`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataBuku),
      }
    );

    const data = await res.json();

    if (res.ok) {
      message.style.color = "green";
      message.textContent = "Data buku berhasil diperbarui!";
    } else {
      message.style.color = "red";
      message.textContent = data.error || "Gagal memperbarui buku.";
    }
  } catch (err) {
    console.error(err);
    message.style.color = "red";
    message.textContent = "Terjadi kesalahan pada server.";
  }
});

fetchBook();
