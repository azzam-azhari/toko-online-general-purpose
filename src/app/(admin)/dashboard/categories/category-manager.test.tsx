import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Category } from "@/types/catalog";

import { CategoryManager } from "./category-manager";

const mocks = vi.hoisted(() => ({
  deleteCategoryAction: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/actions/categories.actions", () => ({
  deleteCategoryAction: mocks.deleteCategoryAction,
  saveCategoryAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh, replace: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn() },
}));

const category: Category = {
  id: "category-id",
  parent_id: null,
  name: "Kategori Uji",
  slug: "kategori-uji",
  description: null,
  icon: "package",
  image_path: null,
  is_active: true,
  sort_order: 0,
  created_at: "2026-07-15T00:00:00.000Z",
  updated_at: "2026-07-15T00:00:00.000Z",
};

describe("CategoryManager", () => {
  it("menjelaskan dampak penghapusan permanen kategori sebelum eksekusi", async () => {
    mocks.deleteCategoryAction.mockResolvedValue({ ok: true, data: { id: category.id } });
    render(<CategoryManager categories={[category]} />);

    fireEvent.click(screen.getByRole("button", { name: "Hapus permanen Kategori Uji" }));

    expect(screen.getByRole("alertdialog")).toHaveTextContent("Hapus kategori secara permanen?");
    expect(screen.getByRole("alertdialog")).toHaveTextContent("tidak dapat dikembalikan");
    expect(screen.getByRole("alertdialog")).toHaveTextContent("produknya tidak ikut dihapus");
    expect(mocks.deleteCategoryAction).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Hapus Permanen" }));
    await waitFor(() => expect(mocks.deleteCategoryAction).toHaveBeenCalledWith(category.id));
    expect(mocks.refresh).toHaveBeenCalled();
  });
});
