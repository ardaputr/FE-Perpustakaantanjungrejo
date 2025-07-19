const cardGrid = document.getElementById("booksCardGrid");

async function fetchBooks() {
  try {
    const res = await fetch(
      "https://be-perpustakaantanjungrejo.vercel.app/books"
    );
    const data = await res.json();

    cardGrid.innerHTML = "";

    data.forEach((buku) => {
      const card = document.createElement("div");
      card.className = "book-card";
      const badgeClass =
        buku.stok > 0 ? "book-stock-badge" : "book-stock-badge out";
      const badgeText = buku.stok > 0 ? `Stok: ${buku.stok}` : "Stok Habis";
      card.innerHTML = `
        <div class="book-img-wrap">
          <img src="${buku.link_gambar}" alt="cover" class="book-img"/>
        </div>
        <div class="book-info">
          <h3 class="book-title">${buku.judul}</h3>
          <div class="book-meta">
            <span>Penulis: <b>${buku.penulis}</b></span><br/>
            <span>Penerbit: ${buku.penerbit}</span><br/>
            <span>Tahun: ${buku.tahun_terbit}</span>
          </div>
          <span class="${badgeClass}">${badgeText}</span>
        </div>
      `;
      cardGrid.appendChild(card);
    });
  } catch (err) {
    console.error("Gagal mengambil data buku:", err);
    cardGrid.innerHTML =
      '<div style="color:red;text-align:center;">Gagal mengambil data buku.</div>';
  }
}

fetchBooks();
