import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Category } from "@/types/catalog";

import ProductsPage from "./page";

const mocks = vi.hoisted(() => ({
  getCategories: vi.fn(),
  getProducts: vi.fn(),
}));

vi.mock("@/lib/repositories/catalog.repository", () => ({
  getCategories: mocks.getCategories,
  getProducts: mocks.getProducts,
}));

vi.mock("./product-row-actions", () => ({
  ProductRowActions: () => null,
}));

const category: Category = {
  id: "00000000-0000-0000-0000-000000000101",
  parent_id: null,
  name: "Kategori Uji",
  slug: "kategori-uji",
  description: null,
  icon: null,
  image_path: null,
  is_active: true,
  sort_order: 0,
  created_at: "2026-07-16T00:00:00.000Z",
  updated_at: "2026-07-16T00:00:00.000Z",
};

describe("ProductsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCategories.mockResolvedValue([category]);
    mocks.getProducts.mockResolvedValue({ products: [], total: 0, page: 1, pageSize: 20 });
  });

  it("meneruskan kategori terpilih ke query produk", async () => {
    render(await ProductsPage({ searchParams: Promise.resolve({ category: category.id }) }));

    expect(mocks.getProducts).toHaveBeenCalledWith({
      search: undefined,
      status: "all",
      categoryId: category.id,
      page: 1,
    });
    expect(screen.getByRole("combobox", { name: "Filter kategori" })).toHaveTextContent(category.name);
    expect(screen.getByText("Coba ubah kata kunci, kategori, atau filter status.")).toBeInTheDocument();
  });
});
