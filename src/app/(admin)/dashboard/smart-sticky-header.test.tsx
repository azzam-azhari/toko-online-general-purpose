import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { SmartStickyHeader } from "./smart-sticky-header";

describe("SmartStickyHeader", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0, writable: true });
  });

  it("tetap normal saat scroll turun lalu menempel saat pengguna scroll naik", () => {
    render(<SmartStickyHeader><span>Navbar admin</span></SmartStickyHeader>);
    const header = screen.getByText("Navbar admin").closest("header");

    expect(header).toHaveAttribute("data-sticky", "false");

    window.scrollY = 500;
    fireEvent.scroll(window);
    expect(header).toHaveAttribute("data-sticky", "false");

    window.scrollY = 488;
    fireEvent.scroll(window);
    expect(header).toHaveAttribute("data-sticky", "true");

    window.scrollY = 505;
    fireEvent.scroll(window);
    expect(header).toHaveAttribute("data-sticky", "false");
  });
});
