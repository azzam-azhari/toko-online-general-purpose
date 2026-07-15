import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-secondary px-4 py-12">
      <div aria-hidden="true" className="absolute -left-32 -top-32 size-80 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-32 -right-32 size-80 rounded-full bg-accent/15 blur-3xl" />
      <div className="relative z-10 min-w-0 w-full max-w-md">
        <Link className="mx-auto mb-6 flex w-fit items-center gap-3 text-foreground" href="/">
          <span className="relative size-11 overflow-hidden rounded-xl bg-white">
            <Image alt="Logo NusaMart" className="object-contain" fill priority sizes="44px" src="/logo/nusamart-logo.png" />
          </span>
          <span>
            <strong className="block text-lg leading-none">NusaMart</strong>
            <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck aria-hidden="true" className="size-3.5" /> Portal admin aman
            </span>
          </span>
        </Link>
        {children}
      </div>
    </main>
  );
}
