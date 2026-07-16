"use client";

import { domAnimation, LazyMotion, m, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

const subtleEase = [0.22, 1, 0.36, 1] as const;

export function PublicPageMotion({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        animate={{ opacity: 1, y: 0 }}
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        key={pathname}
        transition={{ duration: 0.3, ease: subtleEase }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

export function ProductCardMotion({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      className="h-full"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      transition={{ duration: 0.32, ease: subtleEase }}
      viewport={{ amount: 0.15, once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </m.div>
  );
}
