import { render } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { ParticleCanvas } from "@/components/marketing/particle-canvas";

function setReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

afterEach(() => {
  setReducedMotion(false);
  vi.restoreAllMocks();
});

describe("ParticleCanvas", () => {
  it("motion açıkken aria-hidden canvas render eder", () => {
    setReducedMotion(false);
    const { container } = render(<ParticleCanvas className="absolute" />);
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).toHaveClass("absolute");
  });

  it("prefers-reduced-motion: reduce iken hiçbir şey render etmez", () => {
    setReducedMotion(true);
    const { container } = render(<ParticleCanvas />);
    expect(container.querySelector("canvas")).toBeNull();
  });

  it("unmount'ta requestAnimationFrame iptal edilir", () => {
    setReducedMotion(false);
    const cancelSpy = vi.spyOn(window, "cancelAnimationFrame");
    const { unmount } = render(<ParticleCanvas />);
    unmount();
    expect(cancelSpy).toHaveBeenCalled();
  });
});
