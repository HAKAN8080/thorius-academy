import Link from "next/link";
import {
  getInstructorPortalUrl,
  getStudentPortalUrl,
} from "@/lib/config/portal-urls";
import { getInstructorAccess } from "@/lib/instructor/access";

export async function PanelNavLinks() {
  const access = await getInstructorAccess();

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
        href="/"
        className="text-sm text-primary-600 hover:text-primary-900"
      >
        Siteye Dön
      </Link>
    </>
  );
}
