import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DashboardNav } from "./dashboard-nav";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard/settings" }));

describe("DashboardNav mobile", () => {
  it("membuka drawer setinggi viewport dengan area navigasi yang dapat di-scroll", () => {
    render(<DashboardNav storeName="NusaMart" variant="mobile" />);
    fireEvent.click(screen.getByRole("button", { name: "Buka navigasi dashboard" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("h-dvh", "max-h-dvh", "top-0", "bottom-0", "overflow-hidden");

    const navigation = within(dialog).getByRole("navigation", { name: "Navigasi dashboard" });
    expect(navigation.parentElement).toHaveClass("min-h-0", "flex-1", "overflow-y-auto");
    expect(within(navigation).getByRole("link", { name: "Pengaturan" })).toHaveAttribute("aria-current", "page");
  });
});
