import Link from "next/link";
import {
  getInstructorPortalUrl,
  getStudentPortalUrl,
} from "@/lib/config/portal-urls";
import { TutorDashboardLink } from "@/components/layout/tutor-dashboard-link";
import { isCareerPathAdmin } from "@/lib/career-path/admin-access";
import { getInstructorAccess } from "@/lib/instructor/access";

export async function PanelNavLinks() {
  const [access, careerPathAdmin] = await Promise.all([
    getInstructorAccess(),
    isCareerPathAdmin(),
  ]);

  if (access.isInstructor) {
    return (
      <>
        <Link
          href={getInstructorPortalUrl()}
          className="text-sm font-medium text-primary-700 hover:text-primary-900"
        >
          Eğitmen Paneli
        </Link>
        <Link
          href={getStudentPortalUrl()}
          className="text-sm font-medium text-primary-700 hover:text-primary-900"
        >
          Öğrenci Kurslarım
        </Link>
        <Link
          href="/panel/kariyer-yolu"
          className="text-sm font-medium text-primary-700 hover:text-primary-900"
        >
          Kariyer Yolum
        </Link>
        {careerPathAdmin ? (
          <>
            <Link
              href="/panel/yonetim/kariyer-yollari"
              className="text-sm font-medium text-primary-700 hover:text-primary-900"
            >
              Kariyer Yolları Yönetimi
            </Link>
            <Link
              href="/panel/yonetim/kurslar"
              className="text-sm font-medium text-primary-700 hover:text-primary-900"
            >
              Kurs Kataloğu
            </Link>
          </>
        ) : null}
        <TutorDashboardLink variant="instructor" compact />
        <Link
          href="/"
          className="text-sm text-primary-600 hover:text-primary-900"
        >
          Siteye Dön
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href={getStudentPortalUrl()}
        className="text-sm font-medium text-primary-700 hover:text-primary-900"
      >
        Kurslarım
      </Link>
      <Link
        href="/panel/kariyer-yolu"
        className="text-sm font-medium text-primary-700 hover:text-primary-900"
      >
        Kariyer Yolum
      </Link>
      {careerPathAdmin ? (
        <>
          <Link
            href="/panel/yonetim/kariyer-yollari"
            className="text-sm font-medium text-primary-700 hover:text-primary-900"
          >
            Kariyer Yolları Yönetimi
          </Link>
          <Link
            href="/panel/yonetim/kurslar"
            className="text-sm font-medium text-primary-700 hover:text-primary-900"
          >
            Kurs Kataloğu
          </Link>
        </>
      ) : null}
      <TutorDashboardLink variant="student" compact />
      <Link
        href="/"
        className="text-sm text-primary-600 hover:text-primary-900"
      >
        Siteye Dön
      </Link>
    </>
  );
}
