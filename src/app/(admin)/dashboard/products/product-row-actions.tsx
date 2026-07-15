"use client";

import { Archive, Eye, Loader2, PauseCircle, Pencil, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { archiveProductAction, setProductStatusAction } from "@/actions/products.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ProductStatus } from "@/types/catalog";

export function ProductRowActions({ id, name, status }: { id: string; name: string; status: ProductStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function changeStatus() {
    const nextStatus = status === "active" ? "inactive" : "active";
    startTransition(async () => {
      const result = await setProductStatusAction(id, nextStatus);
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success(nextStatus === "active" ? "Produk berhasil diterbitkan." : "Produk dinonaktifkan.");
      router.refresh();
    });
  }

  function archive() {
    startTransition(async () => {
      const result = await archiveProductAction(id);
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("Produk dipindahkan ke arsip.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <Button asChild aria-label={`Pratinjau ${name}`} size="icon" variant="ghost">
        <Link href={`/dashboard/products/${id}/preview`}><Eye aria-hidden="true" /></Link>
      </Button>
      <Button asChild aria-label={`Edit ${name}`} size="icon" variant="ghost">
        <Link href={`/dashboard/products/${id}/edit`}><Pencil aria-hidden="true" /></Link>
      </Button>
      <Button aria-label={status === "active" ? `Nonaktifkan ${name}` : `Terbitkan ${name}`} disabled={pending} onClick={changeStatus} size="icon" type="button" variant="ghost">
        {pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : status === "active" ? <PauseCircle aria-hidden="true" /> : <PlayCircle aria-hidden="true" />}
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button aria-label={`Arsipkan ${name}`} disabled={pending} size="icon" type="button" variant="ghost">
            <Archive aria-hidden="true" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arsipkan produk?</AlertDialogTitle>
            <AlertDialogDescription>
              “{name}” tidak akan tampil di katalog dan daftar utama. Riwayat aktivitasnya tetap tersimpan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={archive}>Arsipkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
