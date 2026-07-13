import { getTranslations } from "next-intl/server";
import { AcademyStatsCounter } from "@/components/marketing/academy-stats-counter";

export async function AcademyStatsSection() {
  const t = await getTranslations("home.stats");

  return (
    <AcademyStatsCounter
      ariaLabel={t("ariaLabel")}
      labels={{
        countries: t("countries"),
        continents: t("continents"),
        students: t("students"),
        hours: t("hours"),
        courses: t("courses"),
        lessons: t("lessons"),
      }}
    />
  );
}
