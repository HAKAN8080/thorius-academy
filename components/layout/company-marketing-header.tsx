import { CompanyHeader } from "@/components/layout/company-header";
import {
  academyPath,
  getCompanyNavLinks,
  resolveCompanyNavHref,
} from "@/lib/site/site-mode";

export function CompanyMarketingHeader() {
  const navLinks = getCompanyNavLinks().map(resolveCompanyNavHref);

  return (
    <CompanyHeader navLinks={navLinks} academyHref={academyPath("/kurslar")} />
  );
}
