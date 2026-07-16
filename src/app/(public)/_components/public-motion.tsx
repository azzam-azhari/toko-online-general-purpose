"use client";

import { domAnimation, LazyMotion, m, useReducedMotion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

const subtleEase = [0.22, 1, 0.36, 1] as const;

export function PublicPageMotion({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const pageKey = `${pathname}?${searchParams.toString()}`;
  const usePageEntrance = pathname !== "/";

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        data-public-page-motion
        initial={reduceMotion || !usePageEntrance ? false : { opacity: 0, scale: 0.997, y: 12 }}
        key={pageKey}
        transition={{ duration: 0.42, ease: subtleEase }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

export function LandingReveal({
  children,
  className,
  delay = 0,
  amount = 0.16,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      className={cn("will-change-transform", className)}
      data-landing-reveal
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      transition={{ delay, duration: 0.48, ease: subtleEase }}
      viewport={{ amount, margin: "0px 0px -8% 0px", once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </m.div>
  );
}

export function ProductCardMotion({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      className="h-full"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      transition={{ duration: 0.38, ease: subtleEase }}
      viewport={{ amount: 0.15, once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </m.div>
  );
}
