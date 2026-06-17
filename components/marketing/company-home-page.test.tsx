import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CompanyHomePage } from "@/components/marketing/company-home-page";

describe("CompanyHomePage", () => {
  it("yükseltilmiş hero başlığını tek kez render eder", () => {
    render(<CompanyHomePage />);
    const headings = screen.getAllByRole("heading", {
      name: /uçtan uca partneriniz/i,
    });
    expect(headings).toHaveLength(1);
  });

  it("hero CTA'sı ile model bölümünü birlikte render eder", () => {
    render(<CompanyHomePage />);
    expect(
      screen.getByRole("link", { name: "Görüşme talep edin" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /Audit.ten sürdürülebilir yetkinliğe/i,
      }),
    ).toBeInTheDocument();
  });
});
