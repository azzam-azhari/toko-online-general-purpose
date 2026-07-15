"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const HEADER_HEIGHT = 64;
const DIRECTION_THRESHOLD = 8;

export function SmartStickyHeader({ children }: { children: React.ReactNode }) {
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    let lastScrollY = Math.max(0, window.scrollY);
    let direction: "up" | "down" | null = null;
    let distance = 0;

    function handleScroll() {
      const currentScrollY = Math.max(0, window.scrollY);
      const delta = currentScrollY - lastScrollY;

      if (currentScrollY <= HEADER_HEIGHT) {
        setPinned(false);
        direction = null;
        distance = 0;
      } else if (delta < 0) {
        if (direction !== "up") {
          direction = "up";
          distance = 0;
        }
        distance += Math.abs(delta);
        if (distance >= DIRECTION_THRESHOLD) setPinned(true);
      } else if (delta > 0) {
        if (direction !== "down") {
          direction = "down";
          distance = 0;
        }
        distance += delta;
        if (distance >= DIRECTION_THRESHOLD) setPinned(false);
      }

      lastScrollY = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-16">
      <header
        className={cn(
          "border-b bg-background transition-shadow duration-200",
          pinned && "fixed inset-x-0 top-0 z-50 shadow-md",
        )}
        data-sticky={pinned ? "true" : "false"}
      >
        {children}
      </header>
    </div>
  );
}
