import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("test altyapısı", () => {
  it("DOM render edip sorgulayabilir", () => {
    render(<div>thorius</div>);
    expect(screen.getByText("thorius")).toBeInTheDocument();
  });
});
