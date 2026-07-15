import "server-only";

import { serverEnv } from "@/configs/env/server";

export type CatalogChange = {
  entity: "product" | "category";
  operation: "created_or_updated" | "status_changed" | "deleted";
  id: string;
};

export async function broadcastCatalogChange(change: CatalogChange): Promise<boolean> {
  try {
    const response = await fetch(
      `${serverEnv.supabaseUrl}/realtime/v1/api/broadcast/catalog/events/catalog_changed`,
      {
        method: "POST",
        headers: {
          apikey: serverEnv.serviceRoleKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(change),
        cache: "no-store",
      },
    );

    return response.ok;
  } catch {
    return false;
  }
}
