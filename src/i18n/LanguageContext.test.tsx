import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "./LanguageContext";

function Probe() {
  const { locale, toggleLocale } = useLanguage();
  return (
    <button onClick={toggleLocale}>{locale}</button>
  );
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

// Regression test for BUG-03: document.documentElement.lang must always match
// the active UI locale, not stay hardcoded.
describe("LanguageProvider", () => {
  it("keeps document.documentElement.lang in sync with the active locale", () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>
    );

    const initialLocale = screen.getByRole("button").textContent;
    expect(document.documentElement.lang).toBe(initialLocale);

    fireEvent.click(screen.getByRole("button"));

    const nextLocale = screen.getByRole("button").textContent;
    expect(nextLocale).not.toBe(initialLocale);
    expect(document.documentElement.lang).toBe(nextLocale);
  });
});
