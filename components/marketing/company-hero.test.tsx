import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CompanyHero } from "@/components/marketing/company-hero";
import {
  COMPANY_LEGAL_NAME,
  COMPANY_TAGLINE,
  COMPANY_HERO_SUBTITLE,
} from "@/lib/content/company-model";

describe("CompanyHero", () => {
  it("şirket adı, başlık ve tagline'ları render eder", () => {
    render(<CompanyHero />);
    expect(screen.getByText(COMPANY_LEGAL_NAME)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /uçtan uca partneriniz/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(COMPANY_TAGLINE)).toBeInTheDocument();
    expect(screen.getByText(COMPANY_HERO_SUBTITLE)).toBeInTheDocument();
  });

  it("iki CTA'yı doğru href ile render eder", () => {
    render(<CompanyHero />);
    expect(
      screen.getByRole("link", { name: "Görüşme talep edin" }),
    ).toHaveAttribute("href", "/kurumsal#iletisim");
    expect(
      screen.getByRole("link", { name: "Modelimizi keşfedin" }),
    ).toHaveAttribute("href", "/#model");
  });

  it("dört ekosistem etiketini render eder", () => {
    render(<CompanyHero />);
    for (const label of ["Danışmanlık", "AI4U Retail", "Academy", "Coaching"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
});
