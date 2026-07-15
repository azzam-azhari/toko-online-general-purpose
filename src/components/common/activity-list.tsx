import { Activity, FolderTree, Package, PanelsTopLeft, ReceiptText, Store } from "lucide-react";

import type { ActivityLog } from "@/types/catalog";

const actionLabels: Record<string, string> = {
  "product.created": "menambahkan produk",
  "product.updated": "memperbarui produk",
  "product.archived": "mengarsipkan produk",
  "product.status_changed": "mengubah status produk",
  "category.created": "menambahkan kategori",
  "category.updated": "memperbarui kategori",
  "category.archived": "mengarsipkan kategori",
  "order.status_changed": "mengubah status pesanan",
  "banner.created": "menambahkan banner",
  "banner.updated": "memperbarui banner",
  "banner.archived": "mengarsipkan banner",
  "testimonial.created": "menambahkan testimoni",
  "testimonial.updated": "memperbarui testimoni",
  "testimonial.archived": "mengarsipkan testimoni",
  "faq.created": "menambahkan FAQ",
  "faq.updated": "memperbarui FAQ",
  "faq.archived": "mengarsipkan FAQ",
  "store_settings.updated": "memperbarui profil toko",
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

function getEntityName(log: ActivityLog) {
  const source = log.after_data ?? log.before_data;
  const name = source?.name ?? source?.title ?? source?.question ?? source?.author_name ?? source?.order_number ?? source?.store_name;
  return typeof name === "string" ? name : null;
}

export function ActivityList({ logs }: { logs: ActivityLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center px-5 py-10 text-center text-sm text-muted-foreground">
        <Activity aria-hidden="true" className="mb-3 size-8 opacity-45" />
        Aktivitas katalog akan tampil di sini.
      </div>
    );
  }

  return (
    <ol className="divide-y">
      {logs.map((log) => {
        const Icon = log.entity_type === "category" ? FolderTree : log.entity_type === "order" ? ReceiptText : log.entity_type === "store_settings" ? Store : ["banner", "testimonial", "faq"].includes(log.entity_type) ? PanelsTopLeft : Package;
        const entityName = getEntityName(log);
        return (
          <li className="flex gap-3 px-5 py-4" key={log.id}>
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-primary">
              <Icon aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-6">
                <span className="font-semibold">{log.actor_name ?? "Admin"}</span>{" "}
                {actionLabels[log.action] ?? log.action}
                {entityName ? <span className="font-medium"> “{entityName}”</span> : null}.
              </p>
              <time className="text-xs text-muted-foreground" dateTime={log.created_at}>
                {dateFormatter.format(new Date(log.created_at))}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
