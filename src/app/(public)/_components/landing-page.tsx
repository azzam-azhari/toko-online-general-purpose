"use client";

import Image from "next/image";
import {
  ArrowRight,
  ArrowUp,
  Heart,
  Menu,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";

type Product = {
  id: string;
  category: string;
  categoryLabel: string;
  name: string;
  image: string;
  imageAlt: string;
  badge: string;
  badgeVariant?: "new";
  rating?: string;
  reviewCount?: number;
  price: string;
  oldPrice?: string;
};

const categories = [
  {
    id: "fashion",
    name: "Fashion",
    count: "240+ Produk",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=500&q=80",
    alt: "Koleksi pakaian fashion",
  },
  {
    id: "elektronik",
    name: "Elektronik",
    count: "180+ Produk",
    image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=500&q=80",
    alt: "Perangkat elektronik modern",
  },
  {
    id: "rumah",
    name: "Rumah & Hidup",
    count: "320+ Produk",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=500&q=80",
    alt: "Dekorasi rumah dan ruang kerja",
  },
  {
    id: "kecantikan",
    name: "Kecantikan",
    count: "150+ Produk",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=500&q=80",
    alt: "Produk kecantikan dan perawatan",
  },
  {
    id: "olahraga",
    name: "Olahraga",
    count: "95+ Produk",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=500&q=80",
    alt: "Peralatan olahraga",
  },
  {
    id: "aksesori",
    name: "Aksesori",
    count: "210+ Produk",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=80",
    alt: "Koleksi aksesori kacamata",
  },
] as const;

const products: Product[] = [
  {
    id: "sonora-pro",
    category: "elektronik",
    categoryLabel: "Elektronik",
    name: "Sonora Pro Wireless Headphone",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=650&q=85",
    imageAlt: "Headphone Sonora Pro berwarna hitam",
    badge: "-25%",
    rating: "★★★★★",
    reviewCount: 128,
    price: "Rp749.000",
    oldPrice: "Rp999.000",
  },
  {
    id: "aruna-classic",
    category: "aksesori",
    categoryLabel: "Aksesori",
    name: "Aruna Classic Watch",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=650&q=85",
    imageAlt: "Jam tangan Aruna Classic",
    badge: "Terlaris",
    badgeVariant: "new",
    rating: "★★★★★",
    reviewCount: 94,
    price: "Rp499.000",
    oldPrice: "Rp625.000",
  },
  {
    id: "karsa-run",
    category: "fashion",
    categoryLabel: "Fashion",
    name: "Karsa Run Everyday Sneakers",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=650&q=85",
    imageAlt: "Sepatu Karsa Run berwarna merah",
    badge: "-18%",
    rating: "★★★★★",
    reviewCount: 76,
    price: "Rp639.000",
    oldPrice: "Rp779.000",
  },
  {
    id: "sora-lounge",
    category: "rumah",
    categoryLabel: "Rumah & Hidup",
    name: "Sora Lounge Chair",
    image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=650&q=85",
    imageAlt: "Kursi kayu Sora Lounge",
    badge: "Baru",
    badgeVariant: "new",
    rating: "★★★★☆",
    reviewCount: 51,
    price: "Rp1.249.000",
    oldPrice: "Rp1.399.000",
  },
  {
    id: "elara-bloom",
    category: "kecantikan",
    categoryLabel: "Kecantikan",
    name: "Elara Bloom Eau de Parfum",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=650&q=85",
    imageAlt: "Parfum Elara Bloom",
    badge: "-20%",
    rating: "★★★★★",
    reviewCount: 110,
    price: "Rp359.000",
    oldPrice: "Rp449.000",
  },
  {
    id: "lumina-mini",
    category: "elektronik",
    categoryLabel: "Elektronik",
    name: "Lumina Mini Mirrorless Camera",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=650&q=85",
    imageAlt: "Kamera Lumina Mini",
    badge: "Favorit",
    badgeVariant: "new",
    rating: "★★★★★",
    reviewCount: 83,
    price: "Rp5.899.000",
    oldPrice: "Rp6.250.000",
  },
  {
    id: "aksa-move",
    category: "olahraga",
    categoryLabel: "Olahraga",
    name: "Aksa Move Premium Yoga Mat",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=650&q=85",
    imageAlt: "Matras yoga Aksa Move",
    badge: "-15%",
    rating: "★★★★★",
    reviewCount: 67,
    price: "Rp289.000",
    oldPrice: "Rp339.000",
  },
  {
    id: "nara-daily",
    category: "fashion",
    categoryLabel: "Fashion",
    name: "Nara Daily Urban Backpack",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=650&q=85",
    imageAlt: "Tas ransel Nara Daily",
    badge: "Baru",
    badgeVariant: "new",
    rating: "★★★★☆",
    reviewCount: 42,
    price: "Rp429.000",
    oldPrice: "Rp479.000",
  },
];

const latestProducts: Product[] = [
  {
    id: "nami-shade",
    category: "aksesori",
    categoryLabel: "Aksesori",
    name: "Nami Shade Sunglasses",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=550&q=85",
    imageAlt: "Kacamata Nami Shade",
    badge: "Baru",
    badgeVariant: "new",
    price: "Rp279.000",
  },
  {
    id: "rupa-wallet",
    category: "fashion",
    categoryLabel: "Fashion",
    name: "Rupa Leather Wallet",
    image: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=550&q=85",
    imageAlt: "Dompet kulit Rupa",
    badge: "Baru",
    badgeVariant: "new",
    price: "Rp319.000",
  },
  {
    id: "tala-brew",
    category: "rumah",
    categoryLabel: "Rumah & Hidup",
    name: "Tala Brew Coffee Set",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=550&q=85",
    imageAlt: "Set kopi Tala Brew",
    badge: "Baru",
    badgeVariant: "new",
    price: "Rp389.000",
  },
  {
    id: "kala-glow",
    category: "kecantikan",
    categoryLabel: "Kecantikan",
    name: "Kala Glow Daily Serum",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=550&q=85",
    imageAlt: "Serum kulit Kala Glow",
    badge: "Baru",
    badgeVariant: "new",
    price: "Rp219.000",
  },
];

const testimonials = [
  {
    name: "Ayu Lestari",
    meta: "Pelanggan sejak 2024",
    text: "Belanja di sini benar-benar praktis. Produknya sama persis dengan foto, kemasannya rapi, dan datang lebih cepat dari perkiraan.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
  },
  {
    name: "Dimas Pratama",
    meta: "Pelanggan terverifikasi",
    text: "Customer service responsif banget waktu saya salah pilih ukuran. Proses tukarnya cepat dan tidak berbelit-belit. Sangat direkomendasikan.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  },
  {
    name: "Nadia Putri",
    meta: "Member Nusa+",
    text: "Senang karena koleksinya terasa terkurasi, jadi tidak capek memilih. Harga masuk akal dan kualitas barangnya melebihi ekspektasi.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
  },
];

const heroAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
];

const filterOptions = [
  ["all", "Semua"],
  ["fashion", "Fashion"],
  ["elektronik", "Elektronik"],
  ["rumah", "Rumah"],
  ["kecantikan", "Kecantikan"],
  ["olahraga", "Olahraga"],
  ["aksesori", "Aksesori"],
] as const;

function Brand() {
  return (
    <a aria-label="NusaMart beranda" className="brand" href="#home">
      <span className="brand-mark">N</span>
      NusaMart
    </a>
  );
}

function ProductCard({
  product,
  isFavorite,
  onAdd,
  onFavorite,
}: {
  product: Product;
  isFavorite: boolean;
  onAdd: () => void;
  onFavorite: () => void;
}) {
  return (
    <article className="product-card">
      <div className="product-media">
        <Image
          alt={product.imageAlt}
          fill
          sizes="(max-width: 560px) 50vw, (max-width: 1050px) 50vw, 25vw"
          src={product.image}
        />
        <span className={`product-badge${product.badgeVariant === "new" ? " new" : ""}`}>
          {product.badge}
        </span>
        <button
          aria-label={`${isFavorite ? "Hapus" : "Tambahkan"} ${product.name} ${isFavorite ? "dari" : "ke"} favorit`}
          className={`wish-btn${isFavorite ? " active" : ""}`}
          onClick={onFavorite}
          type="button"
        >
          <Heart aria-hidden="true" fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="product-info">
        <span className="product-category">{product.categoryLabel}</span>
        <h3>{product.name}</h3>
        {product.rating ? (
          <div aria-label={`Rating ${product.rating}`} className="rating">
            {product.rating} <span>({product.reviewCount})</span>
          </div>
        ) : null}
        <div className="price-row">
          <div className="price">
            <strong>{product.price}</strong>
            {product.oldPrice ? <del>{product.oldPrice}</del> : null}
          </div>
          <button
            aria-label={`Tambahkan ${product.name} ke keranjang`}
            className="add-btn"
            onClick={onAdd}
            type="button"
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(
    3 * 24 * 60 * 60 + 12 * 60 * 60 + 45 * 60 + 30,
  );
  const [formNote, setFormNote] = useState("");
  const [showBackTop, setShowBackTop] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  useEffect(() => {
    const timer = window.setInterval(
      () => setSecondsRemaining((current) => Math.max(0, current - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function showToast(message: string) {
    setToast(message);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200);
  }

  function addToCart() {
    setCartCount((count) => count + 1);
    showToast("Produk ditambahkan ke keranjang");
  }

  function toggleFavorite(productId: string) {
    const willBeFavorite = !favorites.has(productId);
    setFavorites((current) => {
      const next = new Set(current);
      if (willBeFavorite) next.add(productId);
      else next.delete(productId);
      return next;
    });
    showToast(willBeFavorite ? "Disimpan ke favorit" : "Dihapus dari favorit");
  }

  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get("email");
    setFormNote(`Terima kasih! Penawaran terbaik akan dikirim ke ${email}.`);
    form.reset();
  }

  const days = Math.floor(secondsRemaining / 86400);
  const hours = Math.floor((secondsRemaining % 86400) / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;
  const visibleProducts = filter === "all" ? products : products.filter((product) => product.category === filter);

  return (
    <div className="landing-shell">
      <div className="announcement">
        <div className="container announcement-inner">
          <p>
            <strong>Gratis ongkir</strong> untuk pesanan di atas Rp300.000
          </p>
          <span>•</span>
          <a href="#promo">Lihat promo hari ini →</a>
        </div>
      </div>

      <header className="site-header">
        <nav aria-label="Navigasi utama" className="container nav">
          <Brand />
          <ul className={`nav-links${menuOpen ? " open" : ""}`}>
            {[
              ["#home", "Beranda"],
              ["#kategori", "Kategori"],
              ["#produk", "Produk"],
              ["#terbaru", "Terbaru"],
              ["#tentang", "Tentang Kami"],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} onClick={() => setMenuOpen(false)}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-actions">
            <button aria-label="Cari produk" className="icon-btn search" type="button">
              <Search aria-hidden="true" />
            </button>
            <button aria-label="Produk favorit" className="icon-btn heart" type="button">
              <Heart aria-hidden="true" />
            </button>
            <button aria-label="Keranjang belanja" className="icon-btn" type="button">
              <ShoppingBag aria-hidden="true" />
              <span className="count">{cartCount}</span>
            </button>
            <button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              className="icon-btn menu-btn"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="container hero-grid">
            <div className="hero-content">
              <span className="eyebrow">Pilihan terbaik setiap hari</span>
              <h1>
                Temukan yang pas, untuk hidup yang <em>lebih berkelas.</em>
              </h1>
              <p className="hero-copy">
                Dari kebutuhan harian hingga pelengkap gaya hidup, semuanya dikurasi untuk memberi
                kualitas terbaik tanpa membuat belanja jadi rumit.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#produk">
                  Mulai Belanja <ArrowRight aria-hidden="true" />
                </a>
                <a className="btn btn-secondary" href="#kategori">
                  Jelajahi Kategori
                </a>
              </div>
              <div className="hero-proof">
                <div aria-hidden="true" className="avatar-stack">
                  {heroAvatars.map((avatar) => (
                    <Image alt="" height={100} key={avatar} src={avatar} width={100} />
                  ))}
                </div>
                <div>
                  <div aria-label="Rating 4,9 dari 5" className="stars">
                    ★★★★★
                  </div>
                  <small>Dipercaya 12.000+ pelanggan</small>
                </div>
              </div>
            </div>
            <div aria-label="Koleksi pilihan NusaMart" className="hero-visual">
              <Image
                alt="Pelanggan menikmati pengalaman belanja modern"
                className="hero-main-img"
                fill
                priority
                sizes="(max-width: 820px) 100vw, 50vw"
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1100&q=85"
              />
              <div className="hero-badge">
                BARU
                <br />
                KOLEKSI
                <br />
                2026
              </div>
              <div className="hero-float-card">
                <div className="hero-float-image">
                  <Image
                    alt="Jam tangan minimalis"
                    fill
                    sizes="210px"
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=85"
                  />
                </div>
                <strong>Aruna Classic Watch</strong>
                <span>Mulai Rp499.000</span>
              </div>
            </div>
          </div>
        </section>

        <div className="trust-row">
          <div className="container trust-inner">
            <span className="trust-label">Pembayaran aman melalui</span>
            <div aria-label="Metode pembayaran tersedia" className="trust-logos">
              <span>VISA</span>
              <span>mastercard.</span>
              <span>gopay</span>
              <span>OVO</span>
              <span>DANA</span>
              <span>QRIS</span>
            </div>
          </div>
        </div>

        <section className="promo" id="promo">
          <div className="container promo-card">
            <div className="promo-content">
              <div className="promo-kicker">Promo pertengahan tahun</div>
              <h2>Lebih hemat hingga 40% untuk produk favoritmu.</h2>
              <a className="btn" href="#produk">
                Belanja Sekarang <ArrowRight aria-hidden="true" />
              </a>
            </div>
            <div aria-label="Promo berakhir dalam" className="promo-timer">
              {[
                [pad(days), "Hari"],
                [pad(hours), "Jam"],
                [pad(minutes), "Menit"],
                [pad(seconds), "Detik"],
              ].map(([value, label]) => (
                <div className="time-box" key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="categories" id="kategori">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Kategori unggulan</span>
                <h2 className="section-title">Cari sesuai kebutuhanmu.</h2>
              </div>
              <a className="text-link" href="#produk" onClick={() => setFilter("all")}>
                Lihat semua kategori <ArrowRight aria-hidden="true" />
              </a>
            </div>
            <div className="category-grid">
              {categories.map((category) => (
                <a
                  className="category-card"
                  href="#produk"
                  key={category.id}
                  onClick={() => setFilter(category.id)}
                >
                  <div className="category-media">
                    <Image
                      alt={category.alt}
                      fill
                      sizes="(max-width: 560px) 50vw, (max-width: 1050px) 33vw, 17vw"
                      src={category.image}
                    />
                  </div>
                  <h3>{category.name}</h3>
                  <p>{category.count}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="products-section" id="produk">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Pilihan terpopuler</span>
                <h2 className="section-title">Produk unggulan minggu ini.</h2>
                <p className="section-copy">
                  Produk paling disukai pelanggan, dipilih berdasarkan kualitas, ulasan, dan nilai
                  terbaik.
                </p>
              </div>
              <a className="text-link" href="#terbaru">
                Lihat produk terbaru <ArrowRight aria-hidden="true" />
              </a>
            </div>
            <div aria-label="Filter produk" className="filter-tabs" role="group">
              {filterOptions.map(([value, label]) => (
                <button
                  aria-pressed={filter === value}
                  className={`filter-btn${filter === value ? " active" : ""}`}
                  key={value}
                  onClick={() => setFilter(value)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="product-grid">
              {visibleProducts.map((product) => (
                <ProductCard
                  isFavorite={favorites.has(product.id)}
                  key={product.id}
                  onAdd={addToCart}
                  onFavorite={() => toggleFavorite(product.id)}
                  product={product}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="latest" id="terbaru">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Baru tiba</span>
                <h2 className="section-title">Segar dari koleksi terbaru.</h2>
              </div>
              <a className="text-link" href="#produk">
                Lihat semua produk <ArrowRight aria-hidden="true" />
              </a>
            </div>
            <div className="latest-layout">
              <article className="latest-feature">
                <Image
                  alt="Koleksi fashion terbaru NusaMart"
                  fill
                  sizes="(max-width: 820px) 100vw, 42vw"
                  src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85"
                />
                <div className="latest-overlay">
                  <small>Koleksi Eksklusif 2026</small>
                  <h3>Warna baru untuk cerita barumu.</h3>
                  <a className="text-link" href="#produk">
                    Lihat koleksi <ArrowRight aria-hidden="true" />
                  </a>
                </div>
              </article>
              <div className="latest-list">
                {latestProducts.map((product) => (
                  <ProductCard
                    isFavorite={favorites.has(product.id)}
                    key={product.id}
                    onAdd={addToCart}
                    onFavorite={() => toggleFavorite(product.id)}
                    product={product}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="benefits" id="tentang">
          <div className="container benefit-wrap">
            {[
              [Sparkles, "Kualitas Terkurasi", "Setiap produk melewati seleksi kualitas kami."],
              [Truck, "Pengiriman Cepat", "Pesanan diproses maksimal dalam 24 jam."],
              [ShieldCheck, "Pembayaran Aman", "Transaksi terlindungi dan data terenkripsi."],
              [RotateCcw, "Garansi 14 Hari", "Belanja tenang dengan pengembalian mudah."],
            ].map(([Icon, title, copy]) => (
              <div className="benefit" key={title as string}>
                <div className="benefit-icon">
                  <Icon aria-hidden="true" />
                </div>
                <div>
                  <h3>{title as string}</h3>
                  <p>{copy as string}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="testimonials">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Cerita pelanggan</span>
                <h2 className="section-title">Mereka sudah merasakan bedanya.</h2>
              </div>
              <p className="section-copy">
                Kami mendengarkan setiap masukan untuk terus menghadirkan pengalaman belanja yang
                menyenangkan.
              </p>
            </div>
            <div className="testimonial-grid">
              {testimonials.map((testimonial) => (
                <article className="testimonial-card" key={testimonial.name}>
                  <div className="quote-mark">“</div>
                  <div aria-label="Rating 5 dari 5" className="stars">
                    ★★★★★
                  </div>
                  <p>{testimonial.text}</p>
                  <div className="customer">
                    <Image
                      alt={`Foto ${testimonial.name}`}
                      height={47}
                      src={testimonial.image}
                      width={47}
                    />
                    <div>
                      <strong>{testimonial.name}</strong>
                      <span>{testimonial.meta}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="container cta-card">
            <div className="cta-content">
              <h2>Waktunya menemukan favorit barumu.</h2>
              <p>
                Ribuan produk pilihan menunggu untuk melengkapi keseharianmu. Belanja lebih nyaman,
                mulai hari ini.
              </p>
              <a className="btn" href="#produk">
                Temukan Produkmu <ArrowRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="newsletter" id="kontak">
          <div className="container newsletter-inner">
            <div>
              <h2>Dapatkan kabar baik di inbox.</h2>
              <p>Promo eksklusif, produk baru, dan inspirasi pilihan — tanpa spam.</p>
            </div>
            <form className="subscribe-form" onSubmit={handleSubscribe}>
              <label className="sr-only" htmlFor="email">
                Alamat email
              </label>
              <input id="email" name="email" placeholder="Masukkan alamat email" required type="email" />
              <button className="btn btn-primary" type="submit">
                Daftar Sekarang
              </button>
            </form>
            <p aria-live="polite" className="form-note">
              {formNote}
            </p>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-about">
              <Brand />
              <p>
                Membawa produk berkualitas lebih dekat untuk membantu setiap orang menjalani hidup
                yang lebih nyaman dan penuh gaya.
              </p>
              <div className="socials">
                <a aria-label="Instagram" href="#">
                  ig
                </a>
                <a aria-label="TikTok" href="#">
                  tk
                </a>
                <a aria-label="Facebook" href="#">
                  fb
                </a>
                <a aria-label="X" href="#">
                  x
                </a>
              </div>
            </div>
            {[
              ["Jelajahi", [["Semua Kategori", "#kategori"], ["Produk Unggulan", "#produk"], ["Produk Terbaru", "#terbaru"], ["Promo", "#promo"]]],
              ["Bantuan", [["Cara Belanja", "#"], ["Pengiriman", "#"], ["Pengembalian", "#"], ["Hubungi Kami", "#kontak"]]],
              ["Informasi", [["Tentang NusaMart", "#tentang"], ["Kebijakan Privasi", "#"], ["Syarat & Ketentuan", "#"], ["Karier", "#"]]],
            ].map(([title, links]) => (
              <div className="footer-col" key={title as string}>
                <h3>{title as string}</h3>
                <ul>
                  {(links as string[][]).map(([label, href]) => (
                    <li key={label}>
                      <a href={href}>{label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <span>© 2026 NusaMart. Seluruh hak dilindungi.</span>
            <span>Dibuat dengan perhatian untuk Indonesia.</span>
          </div>
        </div>
      </footer>

      <div aria-live="polite" className={`toast${toastVisible ? " show" : ""}`} role="status">
        {toast}
      </div>
      <button
        aria-label="Kembali ke atas"
        className={`back-top${showBackTop ? " visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        type="button"
      >
        <ArrowUp aria-hidden="true" />
      </button>
    </div>
  );
}
