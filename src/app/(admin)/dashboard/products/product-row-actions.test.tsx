import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProductRowActions } from "./product-row-actions";

const mocks = vi.hoisted(() => ({
  deleteProductAction: vi.fn(),
  refresh: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/actions/products.actions", () => ({
  deleteProductAction: mocks.deleteProductAction,
  setProductStatusAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: mocks.toastSuccess, warning: vi.fn() },
}));

describe("ProductRowActions", () => {
  it("meminta konfirmasi irreversible sebelum menghapus produk", async () => {
    mocks.deleteProductAction.mockResolvedValue({ ok: true, data: { id: "product-id" } });
    render(<ProductRowActions id="product-id" name="Produk Uji" status="draft" />);

    fireEvent.click(screen.getByRole("button", { name: "Hapus permanen Produk Uji" }));

    expect(screen.getByRole("alertdialog")).toHaveTextContent("Hapus produk secara permanen?");
    expect(screen.getByRole("alertdialog")).toHaveTextContent("tidak dapat dikembalikan");
    expect(mocks.deleteProductAction).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Hapus Permanen" }));
    await waitFor(() => expect(mocks.deleteProductAction).toHaveBeenCalledWith("product-id"));
    expect(mocks.refresh).toHaveBeenCalled();
  });
});
