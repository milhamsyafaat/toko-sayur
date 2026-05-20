// --- Helper: Format & Get WA Number Dynamically ---
function formatWhatsAppNumber(phoneStr) {
  let numOnly = phoneStr.replace(/[^0-9]/g, "");
  if (numOnly.startsWith("0")) {
    numOnly = "62" + numOnly.slice(1);
  }
  return numOnly;
}

function getStoreWhatsAppNumber() {
  // 1. Cari di bagian informasi kontak
  const kontakLi = document.querySelectorAll(".kontak-info ul li");
  for (let li of kontakLi) {
    if (li.textContent.includes("WhatsApp:") || li.textContent.includes("📱")) {
      const text = li.textContent;
      const numOnly = text.replace(/[^0-9]/g, "");
      if (numOnly.length >= 10) {
        return formatWhatsAppNumber(numOnly);
      }
    }
  }

  // 2. Cari di bagian cara pemesanan
  const langkahLi = document.querySelectorAll(".langkah-list li");
  for (let li of langkahLi) {
    const text = li.textContent;
    const numOnly = text.replace(/[^0-9]/g, "");
    if (numOnly.length >= 10) {
      return formatWhatsAppNumber(numOnly);
    }
  }

  return "628974733759"; // Fallback ke nomor baru Anda
}


// --- 1. TEMA GELAP / TERANG (DARK MODE) ---
const themeToggle = document.getElementById("theme-toggle");

function updateThemeIcon(isDark) {
  themeToggle.textContent = isDark ? "☀️" : "🌙";
}

// Check local storage on page load
const isDarkModeSaved = localStorage.getItem("darkMode") === "true";
if (isDarkModeSaved) {
  document.body.classList.add("dark-mode");
  updateThemeIcon(true);
} else {
  document.body.classList.remove("dark-mode");
  updateThemeIcon(false);
}

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", isDark);
  updateThemeIcon(isDark);
});


// --- 2. GLASSMORPHISM NAVBAR ON SCROLL ---
const navbar = document.querySelector(".navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("navbar-scrolled");
  } else {
    navbar.classList.remove("navbar-scrolled");
  }
});


// --- 3. STATE KERANJANG BELANJA ---
let cart = [];
const semuaTombol = document.querySelectorAll(".btn-tambah");
const cartCount = document.getElementById("cart-count");
const cartDropdown = document.getElementById("cart-dropdown");
const cartBtn = document.getElementById("cart-btn");
const cartItemsList = document.getElementById("cart-items");
const cartTotalPrice = document.getElementById("cart-total-price");
const btnCheckout = document.getElementById("btn-checkout");


// --- 4. TOGGLE TAMPILAN KERANJANG (DROPDOWN) ---
cartBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  cartDropdown.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (!cartBtn.contains(e.target) && !cartDropdown.contains(e.target)) {
    cartDropdown.classList.remove("show");
  }
});


// --- 5. HAPUS/TAMBAH KUANTITAS DI DROPDOWN (EVENT DELEGATION) ---
cartItemsList.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-qty")) {
    const name = e.target.getAttribute("data-name");
    const isPlus = e.target.classList.contains("btn-plus");
    const item = cart.find(i => i.name === name);

    if (item) {
      if (isPlus) {
        item.quantity += 1;
      } else {
        item.quantity -= 1;
        if (item.quantity <= 0) {
          cart = cart.filter(i => i.name !== name);
        }
      }
      updateCartUI();
    }
  }
});


// --- 6. UPDATE ANTARMUKA (UI) KERANJANG ---
function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  cartItemsList.innerHTML = "";

  if (cart.length === 0) {
    cartItemsList.innerHTML = `<li class="empty-cart">Keranjang masih kosong</li>`;
    cartTotalPrice.textContent = "Rp 0";
    return;
  }

  let totalPrice = 0;

  cart.forEach(item => {
    const subtotal = item.price * item.quantity;
    totalPrice += subtotal;

    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <div class="cart-item-details">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">Rp ${item.price.toLocaleString("id-ID")} x ${item.quantity}</span>
      </div>
      <div class="cart-item-qty">
        <button class="btn-qty btn-minus" data-name="${item.name}">-</button>
        <span class="qty-count">${item.quantity}</span>
        <button class="btn-qty btn-plus" data-name="${item.name}">+</button>
      </div>
    `;
    cartItemsList.appendChild(li);
  });

  cartTotalPrice.textContent = `Rp ${totalPrice.toLocaleString("id-ID")}`;
}


// --- 7. FITUR TAMBAH PRODUK DARI TABEL ---
semuaTombol.forEach(function (tombol) {
  tombol.addEventListener("click", function () {
    const tr = tombol.closest("tr");
    const name = tr.cells[0].textContent.trim();
    const unit = tr.cells[1].textContent.trim();
    const priceText = tr.cells[2].textContent.trim();
    const price = parseInt(priceText.replace(/[^0-9]/g, ""), 10);

    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ name, price, quantity: 1, unit });
    }

    updateCartUI();

    tombol.textContent = "Ditambahkan";
    setTimeout(() => {
      tombol.textContent = "+ Tambah";
    }, 1500);
  });
});


// --- 8. INTEGRASI WHATSAPP CHECKOUT ---
btnCheckout.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Keranjang belanja Anda masih kosong!");
    return;
  }

  let message = "Halo Toko Sayur Bu Ani, saya ingin memesan:\n\n";
  let total = 0;

  cart.forEach(item => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    message += `- ${item.name} (${item.quantity} x Rp ${item.price.toLocaleString("id-ID")} = Rp ${subtotal.toLocaleString("id-ID")})\n`;
  });

  message += `\n*Total Pembayaran: Rp ${total.toLocaleString("id-ID")}*\n\nMohon diantar ke alamat saya. Terima kasih!`;
  
  const phone = getStoreWhatsAppNumber();
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
});


// --- 9. FITUR FORM KONTAK - PESAN BERHASIL DIKIRIM ---
const formKontak = document.getElementById("form-kontak");

formKontak.addEventListener("submit", function (event) {
  event.preventDefault();

  const nama = document.getElementById("nama").value;
  const telepon = document.getElementById("telepon").value;
  const pesan = document.getElementById("pesan").value;

  // Kirim juga pesan kontak ini via WhatsApp ke nomor toko yang tertera di HTML
  const storeWA = getStoreWhatsAppNumber();
  const waMessage = `Halo Toko Sayur Bu Ani,\n\nSaya *${nama}* (No. WA: ${telepon}) mengirimkan pesan berikut:\n\n"${pesan}"`;
  const url = `https://wa.me/${storeWA}?text=${encodeURIComponent(waMessage)}`;
  window.open(url, "_blank");

  // Tampilkan notifikasi sukses di web
  tampilkanNotifikasi(nama);

  // Reset form
  formKontak.reset();
});


// --- 10. TOAST NOTIFICATION ---
function tampilkanNotifikasi(nama) {
  const toast = document.createElement("div");
  toast.className = "toast-notif";
  toast.innerHTML = `
    <span class="toast-icon">✅</span>
    <div>
      <strong>Halo ${nama}!</strong><br>
      Pesan Anda berhasil dikirim ke Toko Sayur Bu Ani.
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 4000);
}
