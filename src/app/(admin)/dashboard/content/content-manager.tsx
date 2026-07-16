"use client";

import { Archive, ImagePlus, Loader2, Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  archiveContentAction,
  saveBannerAction,
  saveFaqAction,
  saveTestimonialAction,
} from "@/actions/operations.actions";
import { EmptyState } from "@/components/common/empty-state";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Banner, Faq, Testimonial } from "@/types/operations";

type ContentEntity = Banner | Testimonial | Faq;
type ContentKind = "banner" | "testimonial" | "faq";

const copy = {
  banner: { singular: "Banner", plural: "Banner", empty: "Banner promo akan tampil di beranda setelah diterbitkan." },
  testimonial: { singular: "Testimoni", plural: "Testimoni", empty: "Testimoni dengan persetujuan pelanggan akan tampil di beranda." },
  faq: { singular: "FAQ", plural: "FAQ", empty: "Tambahkan pertanyaan yang sering diajukan oleh pelanggan." },
};

function getTitle(kind: ContentKind, item: ContentEntity) {
  if (kind === "banner") return (item as Banner).title;
  if (kind === "testimonial") return (item as Testimonial).author_name;
  return (item as Faq).question;
}

function getSummary(kind: ContentKind, item: ContentEntity) {
  if (kind === "banner") return (item as Banner).subtitle;
  if (kind === "testimonial") return (item as Testimonial).quote;
  return (item as Faq).answer;
}

function jakartaInput(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(new Date(value)).replace(" ", "T");
}

function ContentFields({ kind, item, errors }: { kind: ContentKind; item: ContentEntity | null; errors: Record<string, string[]> }) {
  const fieldError = (name: string) => errors[name]?.[0] ? <p className="mt-1 text-sm text-destructive">{errors[name][0]}</p> : null;
  return (
    <>
      {item ? <input name="id" type="hidden" value={item.id} /> : null}
      {kind === "banner" ? (
        <>
          <div><Label htmlFor="content-title">Judul</Label><Input defaultValue={(item as Banner | null)?.title ?? ""} id="content-title" name="title" />{fieldError("title")}</div>
          <div><Label htmlFor="content-subtitle">Deskripsi singkat</Label><Textarea defaultValue={(item as Banner | null)?.subtitle ?? ""} id="content-subtitle" name="subtitle" />{fieldError("subtitle")}</div>
          <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="content-link-label">Label tombol</Label><Input defaultValue={(item as Banner | null)?.link_label ?? ""} id="content-link-label" name="link_label" placeholder="Contoh: Lihat Promo" /></div><div><Label htmlFor="content-link-url">URL tujuan HTTPS</Label><Input defaultValue={(item as Banner | null)?.link_url ?? ""} id="content-link-url" name="link_url" placeholder="https://..." />{fieldError("link_url")}</div></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="content-starts">Mulai tampil</Label><Input defaultValue={jakartaInput((item as Banner | null)?.starts_at)} id="content-starts" name="starts_at" type="datetime-local" /></div><div><Label htmlFor="content-ends">Selesai tampil</Label><Input defaultValue={jakartaInput((item as Banner | null)?.ends_at)} id="content-ends" name="ends_at" type="datetime-local" />{fieldError("ends_at")}</div></div>
          <AssetField existing={(item as Banner | null)?.image_path} label="Gambar banner" />
        </>
      ) : null}
      {kind === "testimonial" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="content-author">Nama pelanggan</Label><Input defaultValue={(item as Testimonial | null)?.author_name ?? ""} id="content-author" name="author_name" />{fieldError("author_name")}</div><div><Label htmlFor="content-role">Keterangan</Label><Input defaultValue={(item as Testimonial | null)?.author_title ?? ""} id="content-role" name="author_title" placeholder="Contoh: Pelanggan terverifikasi" /></div></div>
          <div><Label htmlFor="content-quote">Isi testimoni</Label><Textarea defaultValue={(item as Testimonial | null)?.quote ?? ""} id="content-quote" name="quote" />{fieldError("quote")}</div>
          <div><Label htmlFor="content-rating">Rating</Label><Select defaultValue={String((item as Testimonial | null)?.rating ?? 5)} name="rating"><SelectTrigger className="h-11 w-full" id="content-rating"><SelectValue /></SelectTrigger><SelectContent>{[5,4,3,2,1].map((rating) => <SelectItem key={rating} value={String(rating)}>{rating} bintang</SelectItem>)}</SelectContent></Select></div>
          <AssetField existing={(item as Testimonial | null)?.image_path} label="Foto pelanggan (opsional)" />
          <label className="flex items-start gap-3 rounded-lg border p-3 text-sm"><input className="mt-1 size-4 accent-primary" defaultChecked={Boolean((item as Testimonial | null)?.consented_at)} name="has_consent" type="checkbox" /><span><strong className="block">Persetujuan sudah diperoleh</strong><span className="text-xs text-muted-foreground">Wajib sebelum testimoni dapat diterbitkan.</span></span></label>{fieldError("has_consent")}
        </>
      ) : null}
      {kind === "faq" ? (
        <>
          <div><Label htmlFor="content-question">Pertanyaan</Label><Input defaultValue={(item as Faq | null)?.question ?? ""} id="content-question" name="question" />{fieldError("question")}</div>
          <div><Label htmlFor="content-answer">Jawaban</Label><Textarea className="min-h-40" defaultValue={(item as Faq | null)?.answer ?? ""} id="content-answer" name="answer" />{fieldError("answer")}</div>
        </>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="content-order">Urutan tampil</Label><Input defaultValue={item?.sort_order ?? 0} id="content-order" min="0" name="sort_order" type="number" />{fieldError("sort_order")}</div><label className="mt-6 flex items-center gap-3 rounded-lg border px-3 py-2 text-sm"><input className="size-4 accent-primary" defaultChecked={item?.is_active ?? false} name="is_active" type="checkbox" /><span><strong className="block">Tampilkan di website</strong><span className="text-xs text-muted-foreground">Konten langsung tampil bila syaratnya terpenuhi.</span></span></label></div>
    </>
  );
}

function AssetField({ existing, label }: { existing?: string | null; label: string }) {
  return <div><Label htmlFor="content-image">{label}</Label><Input accept="image/avif,image/jpeg,image/png,image/webp" id="content-image" name="image" type="file" />{existing ? <><input name="existing_image_path" type="hidden" value={existing} /><p className="mt-1 text-xs text-muted-foreground">Gambar saat ini tetap digunakan bila tidak memilih file baru.</p></> : <p className="mt-1 text-xs text-muted-foreground">AVIF, JPEG, PNG, atau WebP. Maksimal 5 MB.</p>}</div>;
}

function ArchiveButton({ kind, item }: { kind: ContentKind; item: ContentEntity }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <AlertDialog><AlertDialogTrigger asChild><Button aria-label={`Arsipkan ${getTitle(kind, item)}`} disabled={pending} size="icon" type="button" variant="ghost"><Archive aria-hidden="true" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Arsipkan {copy[kind].singular.toLowerCase()}?</AlertDialogTitle><AlertDialogDescription>Konten tidak lagi tampil di website, tetapi riwayatnya tetap tersimpan.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={() => startTransition(async () => { const result = await archiveContentAction(kind, item.id); if (!result.ok) { toast.error(result.error.message); return; } toast.success(`${copy[kind].singular} berhasil diarsipkan.`); router.refresh(); })}>Arsipkan</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}

export function ContentManager({ kind, items }: { kind: ContentKind; items: ContentEntity[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<ContentEntity | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const openForm = (item: ContentEntity | null) => { setSelected(item); setErrors({}); setOpen(true); };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setErrors({});
    const formData = new FormData(event.currentTarget);
    const result = kind === "banner" ? await saveBannerAction(formData) : kind === "testimonial" ? await saveTestimonialAction(formData) : await saveFaqAction(formData);
    setPending(false);
    if (!result.ok) { setErrors(result.error.fieldErrors ?? {}); toast.error(result.error.message); return; }
    toast.success(`${copy[kind].singular} berhasil disimpan.`); setOpen(false); router.refresh();
  }

  return (
    <>
      <div className="flex justify-end"><Button onClick={() => openForm(null)} type="button"><Plus aria-hidden="true" /> Tambah {copy[kind].singular}</Button></div>
      {items.length === 0 ? <EmptyState action={<Button onClick={() => openForm(null)} type="button"><Plus aria-hidden="true" /> Tambah {copy[kind].singular}</Button>} description={copy[kind].empty} icon={ImagePlus} title={`${copy[kind].plural} belum tersedia`} /> : <div className="grid gap-3">{items.map((item) => <Card key={item.id}><CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{getTitle(kind, item)}</h2><Badge variant={item.is_active ? "secondary" : "outline"}>{item.is_active ? "Tampil" : "Draft"}</Badge></div>{getSummary(kind, item) ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{getSummary(kind, item)}</p> : null}<p className="mt-2 text-xs text-muted-foreground">Urutan {item.sort_order}</p></div><div className="flex shrink-0 justify-end gap-1"><Button aria-label={`Edit ${getTitle(kind, item)}`} onClick={() => openForm(item)} size="icon" type="button" variant="ghost"><Pencil aria-hidden="true" /></Button><ArchiveButton item={item} kind={kind} /></div></CardContent></Card>)}</div>}
      <Dialog onOpenChange={setOpen} open={open}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{selected ? "Edit" : "Tambah"} {copy[kind].singular}</DialogTitle><DialogDescription>Konten yang aktif akan digunakan pada storefront publik.</DialogDescription></DialogHeader><form className="grid gap-4" id="content-form" onSubmit={submit}><ContentFields errors={errors} item={selected} key={selected?.id ?? "new"} kind={kind} /></form><DialogFooter><Button disabled={pending} form="content-form" type="submit">{pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}Simpan {copy[kind].singular}</Button></DialogFooter></DialogContent></Dialog>
    </>
  );
}
