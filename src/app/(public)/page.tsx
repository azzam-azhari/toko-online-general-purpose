import { ArrowRight, BadgeCheck, Search, ShoppingBag, Smartphone, Star } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { serverEnv } from "@/configs/env/server";
import {
  getFeaturedProducts,
  getNewestProducts,
  getStorefrontBanners,
  getStorefrontCategories,
  getStorefrontSettings,
  getStorefrontTestimonials,
} from "@/lib/repositories/storefront.repository";
import { formatRupiah, getPublicAssetUrl, serializeJsonLd } from "@/lib/storefront";

import { ProductCard } from "./_components/product-card";
import { ProductImage } from "./_components/product-image";
import { LandingReveal } from "./_components/public-motion";

export default async function HomePage() {
  const [settings, categories, featured, newest, banners, testimonials] = await Promise.all([
    getStorefrontSettings(),
    getStorefrontCategories(),
    getFeaturedProducts(8),
    getNewestProducts(8),
    getStorefrontBanners(),
    getStorefrontTestimonials(),
  ]);
  const highlighted = featured.length ? featured : newest.slice(0, 4);
  const heroProduct = highlighted[0] ?? newest[0];
  const appUrl = serverEnv.appUrl;

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.store_name,
    url: appUrl,
    description: settings.description,
    email: settings.contact_email,
    telephone: settings.contact_phone,
    address: settings.address,
    sameAs: [settings.facebook_url, settings.instagram_url].filter(Boolean),
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.store_name,
    url: appUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${appUrl.replace(/\/$/, "")}/products?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main>
      <script dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }} type="application/ld+json" />
      <script dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }} type="application/ld+json" />

      <section className="relative isolate overflow-hidden border-b bg-[#f7f4ed]">
        <div className="absolute -left-32 top-10 -z-10 size-80 rounded-full bg-[#f2b84b]/18 blur-3xl" />
        <div className="absolute -right-32 bottom-0 -z-10 size-96 rounded-full bg-primary/12 blur-3xl" />
        <LandingReveal
          amount={0.08}
          className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28"
        >
          <div>
            <Badge className="mb-6 border-primary/15 bg-white text-primary" variant="outline">
              {settings.tagline ?? "Pilihan Tepat, Hidup Lebih Hebat"}
            </Badge>
            <h1 className="max-w-3xl font-serif text-5xl leading-[1.02] tracking-tight text-[#17231f] sm:text-6xl lg:text-7xl">
              Pilihan tepat untuk hari yang <span className="text-primary">lebih hebat.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              Temukan kebutuhan harian dan pelengkap gaya hidup dalam pilihan yang mudah dijelajahi,
              dengan cara membeli yang sesuai untuk setiap produk.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/products">Belanja Sekarang <ArrowRight aria-hidden="true" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#kategori">Jelajahi Kategori</Link>
              </Button>
            </div>
            <form action="/products" className="mt-10 flex max-w-xl gap-2 rounded-2xl border bg-white p-2 shadow-lg shadow-primary/5" role="search">
              <label className="sr-only" htmlFor="hero-search">Cari produk</label>
              <Search aria-hidden="true" className="ml-3 mt-3 size-5 shrink-0 text-muted-foreground" />
              <input className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground" id="hero-search" name="q" placeholder="Cari Nama / Kode Produk..." />
              <Button type="submit">Cari</Button>
            </form>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-3 rotate-2 rounded-[2.5rem] bg-primary/8" />
            <Card className="relative overflow-hidden rounded-[2.25rem] border-white/70 bg-white/80 p-3 shadow-2xl shadow-primary/10 backdrop-blur">
              {heroProduct ? (
                <Link className="group grid gap-4 sm:grid-cols-[1.2fr_.8fr]" href={`/products/${heroProduct.slug}`}>
                  <ProductImage
                    alt={heroProduct.images[0]?.alt_text || heroProduct.name}
                    className="aspect-square rounded-[1.75rem] sm:aspect-[4/5]"
                    priority
                    sizes="(max-width: 640px) 90vw, 360px"
                    src={heroProduct.images[0]?.url}
                  />
                  <div className="flex flex-col justify-between p-3 sm:py-6">
                    <div>
                      <Badge variant="secondary">Pilihan NusaMart</Badge>
                      <h2 className="mt-4 font-serif text-3xl leading-tight">{heroProduct.name}</h2>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {heroProduct.short_description}
                      </p>
                    </div>
                    <div className="mt-6">
                      <p className="text-sm text-muted-foreground">Mulai dari</p>
                      <strong className="text-xl text-primary">{formatRupiah(heroProduct.price)}</strong>
                      <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                        Lihat produk <ArrowRight aria-hidden="true" className="size-4" />
                      </p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="grid min-h-96 place-items-center rounded-[1.75rem] bg-secondary px-8 text-center">
                  <div><ShoppingBag aria-hidden="true" className="mx-auto size-12 text-primary" /><h2 className="mt-4 font-serif text-3xl">Katalog sedang disiapkan</h2><p className="mt-2 text-sm text-muted-foreground">Produk aktif akan tampil di sini setelah diterbitkan.</p></div>
                </div>
              )}
            </Card>
          </div>
        </LandingReveal>
      </section>

      {banners.length ? (
        <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2">
            {banners.slice(0, 2).map((banner, index) => (
              <LandingReveal className="h-full" delay={index * 0.06} key={banner.id}>
                <Card className="relative isolate h-full overflow-hidden border-0 bg-primary text-primary-foreground">
                  {banner.image_path ? <div className="absolute inset-0 -z-10 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${getPublicAssetUrl(settings.asset_base_url, "store-assets", banner.image_path)})` }} /> : null}
                  <CardContent className="p-7 sm:p-9">
                    <h2 className="font-serif text-3xl">{banner.title}</h2>
                    {banner.subtitle ? <p className="mt-2 max-w-lg text-sm leading-6 text-white/75">{banner.subtitle}</p> : null}
                    {banner.link_url && banner.link_label ? <Button asChild className="mt-5 bg-white text-primary hover:bg-white/90" variant="secondary"><a href={banner.link_url}>{banner.link_label}</a></Button> : null}
                  </CardContent>
                </Card>
              </LandingReveal>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="kategori">
        <LandingReveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-bold uppercase tracking-[.16em] text-accent">Kategori</p><h2 className="mt-2 font-serif text-4xl sm:text-5xl">Cari sesuai kebutuhan.</h2></div>
          <Button asChild variant="link"><Link href="/products">Lihat semua <ArrowRight aria-hidden="true" /></Link></Button>
        </LandingReveal>
        {categories.length ? (
          <div className="mt-9 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {categories.slice(0, 8).map((category, index) => (
              <LandingReveal className="h-full" delay={(index % 4) * 0.045} key={category.id}>
                <Link className="group block h-full rounded-2xl border bg-card p-5 transition hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg" href={`/products?category=${category.slug}`}>
                  <span className="grid size-11 place-items-center rounded-xl bg-secondary text-lg font-bold text-primary">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-6 font-bold">{category.name}</h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{category.description ?? "Jelajahi produk dalam kategori ini."}</p>
                </Link>
              </LandingReveal>
            ))}
          </div>
        ) : <LandingReveal><p className="mt-8 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Kategori aktif belum tersedia.</p></LandingReveal>}
      </section>

      <section className="bg-secondary/70 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LandingReveal><div><p className="text-sm font-bold uppercase tracking-[.16em] text-accent">Produk pilihan</p><h2 className="mt-2 font-serif text-4xl sm:text-5xl">Pilihan yang layak dilihat.</h2></div></LandingReveal>
          {highlighted.length ? <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">{highlighted.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <LandingReveal><p className="mt-8 rounded-2xl border border-dashed bg-background p-8 text-center text-sm text-muted-foreground">Produk pilihan akan tampil setelah produk aktif diterbitkan.</p></LandingReveal>}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [BadgeCheck, "Informasi yang jelas", "Harga, stok, dan cara membeli ditampilkan dekat dengan keputusan Anda."],
            [Smartphone, "Nyaman di perangkat apa pun", "Jelajahi katalog dengan nyaman dari ponsel, tablet, maupun desktop."],
            [ShoppingBag, "Cara beli yang sesuai", "Setiap produk mengarahkan Anda ke WhatsApp atau tautan pembelian yang telah dipilih toko."],
          ].map(([Icon, title, copy], index) => (
            <LandingReveal className="h-full" delay={index * 0.06} key={String(title)}>
              <Card className="h-full border-border/70"><CardContent className="p-6"><span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon aria-hidden="true" className="size-5" /></span><h2 className="mt-5 font-bold">{String(title)}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{String(copy)}</p></CardContent></Card>
            </LandingReveal>
          ))}
        </div>
      </section>

      {testimonials.length ? (
        <section className="border-y bg-[#e9f0ea] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <LandingReveal>
              <p className="text-sm font-bold uppercase tracking-[.16em] text-accent">Testimoni</p>
              <h2 className="mt-2 font-serif text-4xl">Cerita dari pelanggan.</h2>
            </LandingReveal>
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <LandingReveal className="h-full" delay={index * 0.06} key={testimonial.id}>
                  <Card className="h-full border-0">
                    <CardContent className="p-6">
                      {testimonial.rating ? (
                        <div className="flex gap-1 text-[#c98216]">
                          <span className="sr-only">Rating {testimonial.rating} dari 5</span>
                          {Array.from({ length: testimonial.rating }, (_, i) => <Star aria-hidden="true" className="size-4 fill-current" key={i} />)}
                        </div>
                      ) : null}
                      <blockquote className="mt-4 text-sm leading-7 text-muted-foreground">“{testimonial.quote}”</blockquote>
                      <p className="mt-5 font-bold">{testimonial.author_name}</p>
                      {testimonial.author_title ? <p className="text-xs text-muted-foreground">{testimonial.author_title}</p> : null}
                    </CardContent>
                  </Card>
                </LandingReveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <LandingReveal>
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#0d392b] px-6 py-14 text-center text-white sm:px-12">
            <div className="absolute -left-20 -top-28 -z-10 size-64 rounded-full border-[40px] border-white/5" />
            <h2 className="mx-auto max-w-3xl font-serif text-4xl sm:text-5xl">Temukan pilihan yang terasa tepat untuk hari Anda.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/65">Katalog dibuat agar produk mudah ditemukan, dibandingkan, dan dibeli.</p>
            <Button asChild className="mt-7 bg-[#f2b84b] text-[#0d392b] hover:bg-white" size="lg"><Link href="/products">Jelajahi Katalog <ArrowRight aria-hidden="true" /></Link></Button>
          </div>
        </LandingReveal>
      </section>
    </main>
  );
}
