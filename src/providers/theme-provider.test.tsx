import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ThemeProvider, useTheme } from "./theme-provider";

function ThemeHarness() {
  const { resolvedTheme, setTheme } = useTheme();
  return <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>{resolvedTheme}</button>;
}

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
  document.documentElement.style.colorScheme = "";
});

describe("ThemeProvider", () => {
  it("mengganti tema tanpa menyisipkan script ke dalam React tree", async () => {
    const { container } = render(<ThemeProvider enableSystem={false}><ThemeHarness /></ThemeProvider>);

    expect(container.querySelector("script")).toBeNull();
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
    expect(window.localStorage.getItem("theme")).toBe("dark");
  });
});
