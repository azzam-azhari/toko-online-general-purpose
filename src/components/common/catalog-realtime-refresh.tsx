"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type RealtimeStatus = "connecting" | "active" | "error";

export function CatalogRealtimeRefresh({ scope }: { scope: "admin" | "public" }) {
  const router = useRouter();
  const [status, setStatus] = useState<RealtimeStatus>("connecting");

  useEffect(() => {
    const supabase = createClient();
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => router.refresh(), 150);
    };

    const channel = supabase
      .channel("catalog")
      .on("broadcast", { event: "catalog_changed" }, refresh)
      .subscribe((channelStatus) => {
        if (channelStatus === "SUBSCRIBED") setStatus("active");
        else if (channelStatus === "CHANNEL_ERROR" || channelStatus === "TIMED_OUT") setStatus("error");
      });

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return (
    <span
      aria-hidden="true"
      className="sr-only"
      data-catalog-realtime={status}
      data-catalog-realtime-scope={scope}
    >
      Realtime katalog {status}
    </span>
  );
}
