const form = document.getElementById("tambahForm");
const message = document.getElementById("message");

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
    const res = await fetch("http://localhost:3000/admin/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataBuku),
    });

    const data = await res.json();
    console.log("Response:", data);

    if (res.ok) {
      message.style.color = "green";
      message.textContent = "Buku berhasil ditambahkan!";
      form.reset();
    } else {
      message.style.color = "red";
      message.textContent = data.error || "Gagal menambah buku.";
    }
  } catch (err) {
    console.error(err);
    message.style.color = "red";
    message.textContent = "Terjadi kesalahan pada server.";
  }
});
