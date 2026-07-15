import { PackageOpen } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export function ProductImage({
  src,
  alt,
  sizes,
  className,
  priority = false,
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-[radial-gradient(circle_at_22%_18%,#fff7dc_0,transparent_32%),linear-gradient(145deg,#e5eee8,#f7f4ed)]",
        className,
      )}
    >
      {src ? (
        <Image
          alt={alt}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          fill
          priority={priority}
          sizes={sizes}
          src={src}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-primary/45">
          <div className="grid size-24 place-items-center rounded-[2rem] border border-primary/10 bg-white/45 shadow-sm backdrop-blur-sm">
            <PackageOpen aria-hidden="true" className="size-11" strokeWidth={1.4} />
          </div>
        </div>
      )}
    </div>
  );
}
