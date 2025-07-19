const form = document.getElementById("pinjamForm");
const message = document.getElementById("message");
const bookDetailDiv = document.getElementById("bookDetail");

const urlParams = new URLSearchParams(window.location.search);
const id_buku = urlParams.get("id");

// Default tanggal hari ini
document.getElementById("tanggal_pinjam").valueAsDate = new Date();

async function loadBook() {
  try {
    const res = await fetch(
      `https://be-perpustakaantanjungrejo.vercel.app/admin/books/${id_buku}`
    );
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Gagal mengambil data buku");

    bookDetailDiv.innerHTML = `
      <p><strong>${data.judul}</strong> oleh ${data.penulis}<br/>
      Penerbit: ${data.penerbit}, Tahun: ${data.tahun_terbit}<br/>
      Stok tersedia: ${data.stok}</p>
    `;

    if (data.stok <= 0) {
      form.style.display = "none";
      message.style.color = "red";
      message.textContent = "Stok habis. Tidak bisa dipinjam.";
    }
  } catch (err) {
    console.error(err);
    bookDetailDiv.innerHTML = `<p style="color:red">${err.message}</p>`;
    form.style.display = "none";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const peminjaman = {
    id_buku,
    nama_peminjam: document.getElementById("nama_peminjam").value.trim(),
    alamat_peminjam: document.getElementById("alamat_peminjam").value.trim(),
    tanggal_peminjaman: document.getElementById("tanggal_pinjam").value,
  };

  try {
    const res = await fetch(
      "https://be-perpustakaantanjungrejo.vercel.app/admin/pinjam",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(peminjaman),
      }
    );

    const data = await res.json();

    if (res.ok) {
      message.style.color = "green";
      message.textContent = "Peminjaman berhasil dicatat!";
      form.reset();

      // Arahkan ke dashboard setelah 1.5 detik
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);
    } else {
      message.style.color = "red";
      message.textContent = data.error || "Gagal meminjam buku.";
    }
  } catch (err) {
    console.error(err);
    message.style.color = "red";
    message.textContent = "Terjadi kesalahan pada server.";
  }
});

loadBook();
