import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Product } from "@/types/catalog";

import { ProductForm } from "./product-form";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  replace: vi.fn(),
  saveProductAction: vi.fn(),
}));

vi.mock("@/actions/products.actions", () => ({
  saveProductAction: mocks.saveProductAction,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh, replace: mocks.replace }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn() },
}));

vi.mock("@/components/common/product-image-uploader", () => ({
  ProductImageUploader: () => <div>Pengunggah gambar</div>,
}));

vi.mock("@/components/common/product-preview", () => ({
  ProductPreview: () => <div>Pratinjau produk</div>,
}));

const product: Product = {
  id: "786dfd95-3f9d-42dc-97ec-33ef4f6bbccd",
  name: "Produk Uji",
  slug: "produk-uji",
  sku: "PRD-001",
  short_description: "Deskripsi singkat produk.",
  description: "Deskripsi lengkap produk.",
  price: 100_000,
  compare_at_price: null,
  stock: 10,
  reserved_stock: 0,
  status: "draft",
  is_featured: false,
  sort_order: 0,
  seo_title: null,
  seo_description: null,
  cta_type: "whatsapp",
  cta_label: "Beli Sekarang",
  custom_url: null,
  whatsapp_number: null,
  whatsapp_template: "Saya tertarik dengan {product_name}.",
  open_in_new_tab: false,
  created_at: "2026-07-16T00:00:00.000Z",
  updated_at: "2026-07-16T00:00:00.000Z",
  product_images: [],
  category_ids: [],
};

describe("ProductForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("membuka daftar produk setelah produk edit berhasil diterbitkan", async () => {
    let finishSaving: ((result: unknown) => void) | undefined;
    mocks.saveProductAction.mockImplementation(() => new Promise((resolve) => {
      finishSaving = resolve;
    }));

    render(<ProductForm categories={[]} product={product} />);

    const publishButton = screen.getByRole("button", { name: "Terbitkan" });
    fireEvent.click(publishButton);

    await waitFor(() => expect(mocks.saveProductAction).toHaveBeenCalledOnce());
    expect(publishButton).toBeDisabled();

    await act(async () => {
      finishSaving?.({
        ok: true,
        data: { id: product.id, status: "active" },
      });
    });

    await waitFor(() => expect(publishButton).toBeEnabled());
    expect(mocks.replace).toHaveBeenCalledWith("/dashboard/products");
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
});
